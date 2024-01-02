import axios from "axios";
import { showAlert } from "./alerts";

const stripe = Stripe(
  "pk_test_51OP4VoDCnw9REc2PDG1MQPKDPelSAyJqF5RWzbRuDY2RDduD4DgDFS2fOIsbKqYiCBHD09o1xCahtWasSeSKnRie00HLS8ZMRb"
);
// pk_test_51OP4VoDCnw9REc2PDG1MQPKDPelSAyJqF5RWzbRuDY2RDduD4DgDFS2fOIsbKqYiCBHD09o1xCahtWasSeSKnRie00HLS8ZMRb"
export const booking = async (tourId) => {
  try {
    const session = await axios.get(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    console.log("ali");
    if (session.data) {
      await stripe.redirectToCheckout({
        sessionId: session.data.session.id,
      });
    } else {
      console.error(
        "Session data is undefined or does not have the expected structure."
      );
    }
    console.log(tourId);
  } catch (error) {
    console.log(error);
    showAlert("error", error);
    if (axios.isAxiosError(error)) {
      // AxiosError: Handle specific Axios-related errors
      console.error("AxiosError:", error.response.status, error.response.data);
    } else {
      // Handle non-Axios errors
      console.error("Non-Axios error:", error.message);
    }
  }
};
