window.addEventListener("DOMContentLoaded", () => {
  const phoneNumber = "+61491570156";

  if (!window.CamaraApi || typeof CamaraApi.checkSimSwap !== "function") {
    console.error("CamaraApi.checkSimSwap is unavailable");
    return;
  }

  CamaraApi.checkSimSwap(phoneNumber)
    .then((result) => {
      const { swapCount = 0, lastSwap } = result;
      if (swapCount > 0) {
        const formattedDate = lastSwap ? new Date(lastSwap).toLocaleString() : "recently";
        alert(`Warning: recent SIM swap detected for ${phoneNumber}. Last swap: ${formattedDate}.`);
      } else {
        console.log("No recent SIM swap detected");
      }
    })
    .catch((error) => {
      console.error("Sim swap check failed", error);
      alert("Unable to verify SIM swap status right now.");
    });
});

