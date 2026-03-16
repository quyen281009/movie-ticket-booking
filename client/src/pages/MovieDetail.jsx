import React, { useEffect, useState } from "react";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, StarIcon } from "lucide-react";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MovieDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [show, setShow] = useState(null);

  const {
    shows,
    axios,
    getToken,
    user,
    fetchFavoriteMovies,
    favoriteMovies,
    image_base_url,
  } = useAppContext();

  const isFavorite = favoriteMovies.some(
    (movie) => movie._id === show?.movie?._id,
  );

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load movie");
    }
  };

  const handleFavorite = async () => {
    try {
      if (!user) return toast.error("Please login to proceed");
      const { data } = await axios.post("/api/user/update-favorites",
        { movieId: show.movie._id },
        {headers: {Authorization: `Bearer ${await getToken()}` }});

      if (data.success) {
        await fetchFavoriteMovies();
        toast.success(data.message);
      }
    } catch (error) {
      console.error(error);
  };
}

  useEffect(() => {
    getShow();
  }, [id]);

  if (!show || !show.movie) return <Loading />;

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-24 md:pt-40">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={image_base_url + show.movie.poster_path}
          alt={show.movie.title}
          className="max-md:mx-auto rounded-xl h-96 max-w-xs object-cover"
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />

          <p className="text-primary font-medium">ENGLISH</p>

          <h1 className="text-4xl font-semibold max-w-md">
            {show.movie.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {show.movie.vote_average.toFixed(1)} User Rating
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.movie.overview}
          </p>

          <p className="text-gray-400 text-sm">
            {timeFormat(show.movie.runtime)} ·{" "}
            {show.movie.genres.map((g) => g.name).join(", ")} ·{" "}
            {show.movie.release_date.split("-")[0]}
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-4 ">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium active:scale-95 cursor-pointer">
              Watch Trailer
            </button>

            <button
              onClick={() => {
                document
                  .getElementById("dateSelect")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-10 py-3 text-sm bg-primary rounded-full hover:bg-primary-dull transition cursor-pointer"
            >
              Buy Tickets
            </button>

            <button
              onClick={handleFavorite}
              className="bg-gray-700 p-2.5 rounded-full active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${favoriteMovies.find(movie => movie._id === show.movie._id) ? 
              "fill-primary text-primary" : "text-gray-400"}`}
              />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-16 text-lg font-medium">Your Favorite Cast</p>

      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-4 w-max px-4">
          {show.movie.casts.slice(0, 12).map((cast, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <img
                src={
                  cast.profile_path
                    ? image_base_url + cast.profile_path
                    : "/avatar.png"
                }
                alt={cast.name}
                className="rounded-full h-20 aspect-square object-cover"
              />
              <p className="font-medium text-xs mt-3">{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="dateSelect">
        <DateSelect dateTime={show.dateTime} id={id} />
      </div>

      <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>

      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {shows.slice(0, 4).map((show) => (
            <MovieCard key={show._id} movie={show.movie} />
          ))}
      </div>

      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            window.scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show more
        </button>
      </div>
    </div>
  );
};

export default MovieDetail;
