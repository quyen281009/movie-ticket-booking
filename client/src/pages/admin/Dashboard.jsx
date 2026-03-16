import { useEffect, useState } from "react";
import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/title";
import BlurCircle from "../../components/BlurCircle";
import dateFormat from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { axios, getToken, user, image_base_url, isAdmin } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
  });

  const [loading, setLoading] = useState(true);

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings || 0,
      icon: ChartLineIcon,
    },
    {
      title: "Total Revenue",
      value: currency + (dashboardData.totalRevenue || 0),
      icon: CircleDollarSignIcon,
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows.length ,
      icon: PlayCircleIcon,
    },
    {
      title: "Total Users",
      value: dashboardData.totalUser || 0,
      icon: UsersIcon,
    },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.success) {
        setDashboardData(
          data.dashboardData || {
            totalBookings: 0,
            totalRevenue: 0,
            activeShows: [],
            totalUser: 0,
          },
        );
      } else {
        toast.error(data?.message || "Failed to fetch dashboard data");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error fetching dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin]);

  if (isAdmin === null) return <Loading />;

  return !loading ? (
    <>
      <Title text1={"Admin"} text2={"Dashboard"} />

      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="-100px" left="0px" />
        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full"
            >
              <div>
                <h1 className="text-sm">{card.title}</h1>
                <p className="text-xl font-medium mt-1">{card.value}</p>
              </div>
              <card.icon className="text-primary" />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-10 text-lg font-medium">Active Shows</p>

      <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
        <BlurCircle top="100px" left="-10px" />

        {dashboardData.activeShows.map((show) => {
          const posterUrl = show.movie?.poster_path
            ? image_base_url + show.movie.poster_path
            : "https://via.placeholder.com/300x450?text=No+Image";

          return (
            <div
              key={show._id || show.id}
              className="w-55 rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300"
            >
              <img
                src={posterUrl}
                alt={show.movie?.title || "Movie"}
                className="h-60 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/300x450?text=No+Image";
                }}
              />
              <p className="font-medium p-2 truncate">
                {show.movie?.title || "Unknown Movie"}
              </p>

              <div className="flex items-center justify-between px-2">
                <p className="text-lg font-medium">
                  {currency} {show.showPrice || 0}
                </p>
                <p className="flex items-center gap-1 text-sm text-gray-400">
                  <StarIcon className="w-4 h-3 text-primary fill-primary" />
                  {(show.movie?.vote_average || 0).toFixed(1)}
                </p>
              </div>

              <p className="px-2 pt-2 text-sm text-gray-500">
                {dateFormat(show.showDateTime)}
              </p>
            </div>
          );
        })}
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default Dashboard;
