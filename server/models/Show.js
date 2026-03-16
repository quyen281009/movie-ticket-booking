import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: Number,
      ref: "Movie",
      required: true,
    },

    movieData: {
      title: String,
      poster_path: String,
      vote_average: Number,
    },

    showDateTime: {
      type: Date,
      required: true,
    },

    showPrice: {
      type: Number,
      required: true,
    },

    occupiedSeats: {
      type: Object,
      default: {},
    },
  },
  { minimize: false },
);


const Show = mongoose.model('Show', showSchema);
export default Show;