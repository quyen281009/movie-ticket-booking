import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import {
  MenuIcon,
  SearchIcon,
  TicketPlus,
  XIcon,
  ShieldIcon,
} from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  const { favoriteMovies, axios, getToken, isAdmin, fetchIsAdmin } = useAppContext();

  const handleScrollTop = () => {
    window.scrollTo(0, 0);
    setIsOpen(false);
  };

  const handleGrantAdmin = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post("/api/user/grant-admin", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        toast.success("Admin role granted! Refreshing...");
        setTimeout(() => {
          fetchIsAdmin();
          navigate("/admin/dashboard");
        }, 1000);
      } else {
        toast.error(data.message || "Failed to grant admin role");
      }
    } catch (error) {
      console.error("Error granting admin role:", error);
      toast.error("Error granting admin role");
    }
  };

  return (
    <div className="fixed top-0 left-0 z-20 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5">
      <Link to="/" className="max-md:flex-1">
        <img src={assets.logo} alt="Logo" className="h-5 w-auto" />
      </Link>

      <div
        className={`max-md:absolute max-md:top-0 max-md:left-0 z-50
        flex flex-col md:flex-row items-center gap-8
        max-md:justify-center max-md:h-screen
        md:px-8 py-3 md:rounded-full
        backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20
        overflow-hidden transition-[width] duration-300
        ${isOpen ? "max-md:w-full" : "max-md:w-0"}`}
      >
        <XIcon
          className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer"
          onClick={() => setIsOpen(false)}
        />

        <Link to="/" onClick={handleScrollTop}>
          Home
        </Link>
        <Link to="/movies" onClick={handleScrollTop}>
          Movies
        </Link>
        <Link to="/" onClick={handleScrollTop}>
          Theaters
        </Link>
        <Link to="/" onClick={handleScrollTop}>
          Releases
        </Link>
        {favoriteMovies.length > 0 && (
          <Link to="/favorite" onClick={handleScrollTop}>
            Favorites
          </Link>
        )}
      </div>

      <div className="flex items-center gap-8">
        <SearchIcon className="max-md:hidden w-6 h-6 cursor-pointer" />

        {!user ? (
          <button
            onClick={openSignIn}
            className="px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
          >
            Login
          </button>
        ) : (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<TicketPlus size={15} />}
                onClick={() => navigate("/my-bookings")}
              />
              {!isAdmin && (
                <UserButton.Action
                  label="Setup Admin"
                  labelIcon={<ShieldIcon size={15} />}
                  onClick={handleGrantAdmin}
                />
              )}
              {isAdmin && (
                <UserButton.Action
                  label="Admin Dashboard"
                  labelIcon={<ShieldIcon size={15} />}
                  onClick={() => navigate("/admin/dashboard")}
                />
              )}
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>

      <MenuIcon
        className="max-md:ml-4 md:hidden w-8 h-8 cursor-pointer"
        onClick={() => setIsOpen(true)}
      />
    </div>
  );
};

export default Navbar;
