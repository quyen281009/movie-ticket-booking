import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../config/nodeMailer.js";

export const inngest = new Inngest({ id: "movie-ticket-booking" });


const syncUserCreate = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: [{ event: "clerk/user.created" }],
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const userData = {
      _id: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    };

    await User.create(userData);
  },
);

const syncUserDelete = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  },
);

const syncUserUpdate = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: [{ event: "clerk/user.updated" }],
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const userData = {
      _id: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    };

    await User.findByIdAndUpdate(id, userData);
  },
);


const releaseSeatsAndDeleteBooking = inngest.createFunction(
  {
    id: "release-seats-delete-booking",
    triggers: [{ event: "app/checkpayment" }],
  },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);

    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;

      const booking = await Booking.findById(bookingId);
      if (!booking) return;

      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);
        if (!show) return;

        booking.bookedSeats.forEach((seat) => {
          show.bookedSeats.pull(seat);
        });

        show.markModified("bookedSeats");
        await show.save();

        await Booking.findByIdAndDelete(booking._id);
      }
    });
  },
);

const sendBookingConfirmationEmail = inngest.createFunction(
  {
    id: "send-booking-confirmation-email",
    triggers: [{ event: "app/show.booked" }],
  },
  async ({ event }) => {
    const { bookingId } = event.data;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", model: "Movie" },
      })
      .populate("user");

    if (!booking) {
      throw new Error("Booking not found");
    }

    await sendEmail({
      to: booking.user.email,

      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,

      body: `
      <div style="font-family: Arial, sans-serif; line-height:1.5;">

        <h2>Hi ${booking.user.name},</h2>

        <p>
          Your booking for 
          <strong style="color:#F84565;">
            ${booking.show.movie.title}
          </strong> 
          is confirmed.
        </p>

        <p>
          <strong>Date:</strong> 
          ${new Date(booking.show.showDateTime).toLocaleDateString("en-US", {
            timeZone: "Asia/Kolkata",
          })}
          <br/>

          <strong>Time:</strong> 
          ${new Date(booking.show.showDateTime).toLocaleTimeString("en-US", {
            timeZone: "Asia/Kolkata",
          })}
        </p>

        <p>Enjoy the show! 🍿</p>

        <p>
          Thanks for booking with us!
          <br/>
          – MovieFilm Team
        </p>

      </div>
      `,
    });
  },
);


const sendShowReminders = inngest.createFunction(
  {
    id: "send-show-reminders",
    triggers: [{ cron: "0 */8 * * *" }],
  },
  async ({ step }) => {
    const now = new Date();

    const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);

    // Prepare reminder tasks
    const reminderTasks = await step.run("fetch-bookings", async () => {
      const bookings = await Booking.find({
        isPaid: true,
      })
        .populate({
          path: "show",
          populate: { path: "movie", model: "Movie" },
        })
        .populate("user");

      return bookings.filter((booking) => {
        const showTime = new Date(booking.show.showDateTime);

        return showTime >= windowStart && showTime <= in8Hours;
      });
    });

    // Send reminder emails
    await step.run("send-reminder-emails", async () => {
      for (const booking of reminderTasks) {
        await sendEmail({
          to: booking.user.email,

          subject: `Reminder: ${booking.show.movie.title} starts soon!`,

          body: `
          <div style="font-family: Arial, sans-serif; line-height:1.5;">

            <h2>Hi ${booking.user.name},</h2>

            <p>
              Just a reminder that your movie 
              <strong style="color:#F84565;">
                ${booking.show.movie.title}
              </strong>
              will start soon!
            </p>

            <p>
              <strong>Date:</strong> 
              ${new Date(booking.show.showDateTime).toLocaleDateString(
                "en-US",
                { timeZone: "Asia/Kolkata" },
              )}
              <br/>

              <strong>Time:</strong> 
              ${new Date(booking.show.showDateTime).toLocaleTimeString(
                "en-US",
                { timeZone: "Asia/Kolkata" },
              )}
            </p>

            <p>🍿 Enjoy your movie!</p>

            <p>
              Thanks for booking with us!
              <br/>
              – ShowFilm Team
            </p>

          </div>
          `,
        });
      }
    });
  },
);

// Inngest Function to send notifications when a new show is added

  const sendNewShowNotifications = inngest.createFunction(
    {
      id: "send-new-show-notifications",
      triggers: [{ event: "app/show.added" }],
    },

    async ({ event }) => {
      const { movieTitle } = event.data;

      const users = await User.find({});

      await Promise.all(
        users.map(async (user) => {
          if (!user.email) return;

          const subject = `🎬 New Show Added: ${movieTitle}`;

          const body = `
          <div style="font-family: Arial, sans-serif; line-height:1.5;">
            
            <h2>Hi ${user.name},</h2>

            <p>
              Great news! A new show for 
              <strong style="color:#F84565;">
                ${movieTitle}
              </strong>
              has just been added.
            </p>

            <p>
              Book your tickets now before seats fill up!
            </p>

            <p>🍿 See you at the movies!</p>

            <p>
              Thanks for using MovieFilm.
              <br/>
              – MovieFilm Team
            </p>

          </div>
          `;

          await sendEmail({
            to: user.email,
            subject,
            body,
          });
        }),
      );
    },
  );

export const functions = [
  syncUserCreate,
  syncUserDelete,
  syncUserUpdate,
  releaseSeatsAndDeleteBooking,
  sendBookingConfirmationEmail,
  sendShowReminders,
  sendNewShowNotifications,
];
