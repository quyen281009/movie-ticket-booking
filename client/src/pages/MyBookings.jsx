import React, { useEffect, useState, useCallback } from "react";
import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";
import timeFormat from "../lib/timeFormat";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import dateFormat from "../lib/dateFormat";

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const { axios, getToken, user, image_base_url } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timers, setTimers] = useState({});

  const getMyBookings = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.log(error);
      toast.error("Cannot load bookings");
    }
    setIsLoading(false);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      getMyBookings();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      getMyBookings();
    }
   }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          if (next[id] > 0) next[id] -= 1;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePayNow = async (bookingId) => {
    try {
      const { data } = await axios.post(
        "/api/booking/create-payment",
        { bookingId },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.message || "Payment failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-32 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />

      <h1 className="text-lg font-semibold mb-6">My Bookings</h1>

      {bookings.map((item) => {
        const movie = item.show?.movie || item.show?.movieData;

        return (
          <div
            key={item._id}
            className="flex flex-col md:flex-row bg-primary/8 border border-primary/20 rounded-lg mt-4 p-3 max-w-3xl"
          >
            <img
              src={image_base_url + movie?.poster_path}
              alt={movie?.title}
              className="md:max-w-[180px] aspect-video object-cover rounded"
            />

            <div className="flex flex-col flex-1 p-4">
              <p className="font-semibold">{movie?.title}</p>

              <p className="text-gray-400 text-sm">
                {timeFormat(movie?.runtime)}
              </p>
              <p className="text-gray-400 text-sm mt-auto">
                {dateFormat(movie?.release_date)}
              </p>
            </div>

            <div className="flex flex-col items-end md:text-right justify-between p-4">
              <div className="flex items-center gap-4">
                <p className="text-2xl font-semibold mb-3">
                  {currency}
                  {item.amount}
                </p>

                {!item.isPaid ? (
                  item.paymentLink && (
                    <button
                      onClick={() => (window.location.href = item.paymentLink)}
                      className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer"
                    >
                      Pay Now
                    </button>
                  )
                ) : (
                  <span className="bg-green-500/20 text-green-400 px-4 py-1.5 mb-3 text-sm rounded-full font-medium">
                    Done ✓
                  </span>
                )}
              </div>

              <div className="text-sm text-right mt-3">
                <p>
                  <span className="text-gray-400">Tickets:</span>{" "}
                  {item.bookedSeats.length}
                </p>

                <p>
                  <span className="text-gray-400">Seats:</span>{" "}
                  {item.bookedSeats.join(", ")}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyBookings;
