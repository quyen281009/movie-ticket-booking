import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/title";
import dateFormat from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";

const ListShows = () => {

  const { axios, getToken, user } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);


  const getAllShows = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-shows", {
        headers: { Authorization: `Bearer ${await getToken()}`}})
      setShows(data.shows);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shows:", error);
    } 
  };

  useEffect(() => {
    if(user) {
      getAllShows();
    }
  }, [user]);

  return !loading ? (
    <>
      <Title text1="List" text2="Shows" />

      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 pl-5">Movie Name</th>
              <th className="p-2">Show Time</th>
              <th className="p-2">Total Bookings</th>
              <th className="p-2">Earnings</th>
            </tr>
          </thead>

          <tbody className="text-sm font-light">
            {shows.map((item, index) => (
              <tr
                key={index}
                className="border-b border-primary/20 bg-primary/5 even:bg-primary/10"
              >
                <td className="p-2 pl-5 min-w-45">{item.movie.title}</td>

                <td className="p-2">{dateFormat(item.showDateTime)}</td>

                <td className="p-2">
                  {Object.keys(item.occupiedSeats).length}
                </td>

                <td className="p-2">
                  {currency}
                  {Object.keys(item.occupiedSeats).length * item.showPrice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default ListShows;
