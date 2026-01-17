// src/pages/Forbidden.jsx
import { useEffect } from "react";
import { toast } from "react-toastify";

const Forbidden = () => {
  useEffect(() => {
    toast.error(
      "⛔ Access Denied: You do not have permission to view this page."
    );
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>403 - Forbidden</h2>
      <p>You tried to access a page without the required permissions.</p>
    </div>
  );
};

export default Forbidden;
