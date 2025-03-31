import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LegalSupport = () => {
  const [legalExperts, setLegalExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [consultationType, setConsultationType] = useState("online");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userBookings, setUserBookings] = useState([]);
  const navigate = useNavigate();

  // Fetch available legal experts
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await axios.get("/api/legal-support/experts");
        setLegalExperts(response.data);
      } catch (err) {
        setError("Failed to fetch legal experts");
      }
    };
    fetchExperts();
  }, []);

  // Fetch user's bookings
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const response = await axios.get("/api/legal-support/bookings", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUserBookings(response.data);
      } catch (err) {
        setError("Failed to fetch your bookings");
      }
    };
    fetchUserBookings();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "/api/legal-support/bookings",
        {
          legalSupportId: selectedExpert,
          bookingDate,
          consultationType,
          notes,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setSuccess("Booking successful!");
      setUserBookings([...userBookings, response.data]);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      await axios.delete(`/api/legal-support/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUserBookings(
        userBookings.filter((booking) => booking._id !== bookingId)
      );
      setSuccess("Booking cancelled successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Cancellation failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Legal Support Booking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Booking Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Book a Session</h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleBookingSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Legal Expert</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedExpert}
                onChange={(e) => setSelectedExpert(e.target.value)}
                required
              >
                <option value="">Select an expert</option>
                {legalExperts.map((expert) => (
                  <option key={expert._id} value={expert._id}>
                    {expert.name} - {expert.specialization?.join(", ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Date & Time</label>
              <input
                type="datetime-local"
                className="w-full p-2 border rounded"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Consultation Type
              </label>
              <select
                className="w-full p-2 border rounded"
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value)}
              >
                <option value="online">Online (Video Call)</option>
                <option value="in-person">In-Person</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                className="w-full p-2 border rounded"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isLoading}
            >
              {isLoading ? "Booking..." : "Book Session"}
            </button>
          </form>
        </div>

        {/* User's Bookings */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>

          {userBookings.length === 0 ? (
            <p className="text-gray-500">You have no upcoming bookings</p>
          ) : (
            <div className="space-y-4">
              {userBookings.map((booking) => (
                <div key={booking._id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {booking.legalSupportId?.name || "Legal Expert"}
                      </h3>
                      <p className="text-gray-600">
                        {new Date(booking.bookingDate).toLocaleString()}
                      </p>
                      <p className="text-gray-600 capitalize">
                        {booking.consultationType}
                      </p>
                      <p className="text-gray-600 capitalize">
                        Status: {booking.status}
                      </p>
                    </div>
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {booking.notes && (
                    <p className="mt-2 text-gray-700">Notes: {booking.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalSupport;
