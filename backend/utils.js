import axios from "axios";
import qs from "qs";
import cron from "node-cron";
/**
 * Send WhatsApp template message via Gupshup API
 * @param {string} phoneNumber
 * * @param {string} templateparams
 */
export async function sendWhatsAppTemplateForSuccess(phoneNumber, templateparams) {
  const url = "https://api.gupshup.io/wa/api/v1/template/msg";

  const data = qs.stringify({
    channel: "whatsapp",
    source: "15557836778",
    destination: "91" + phoneNumber,
    "src.name": "SNSP09",
    template: JSON.stringify({
      id: "dfb747e9-3243-4582-9b33-08595ba659f7",
      params: templateparams,
    }),
    message: JSON.stringify({
      image: {
        link: "https://fss.gupshup.io/0/public/0/0/gupshup/15557836778/76a7e374-aed6-4e74-8789-e208ec70ab8f/1754066475613_WhatsApp%20Image%202025-08-01%20at%2022.09.00_30633e96.jpg",
      },
      type: "image",
    }),
  });

  const headers = {
    "Cache-Control": "no-cache",
    "Content-Type": "application/x-www-form-urlencoded",
    apikey: "1uycnhio0owyjfm9nujcwgm0i3go289m",
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log("Message sent:", response.data);
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response?.data || error.message
    );
  }
}


export async function sendWhatsAppTemplateForNotPaidFee(phoneNumber, templateparams) {
  const url = "https://api.gupshup.io/wa/api/v1/template/msg";

  const data = qs.stringify({
    channel: "whatsapp",
    source: "15557836778",
    destination: "91" + phoneNumber,
    "src.name": "SNSP09",
    template: JSON.stringify({
      id: "5b648b0f-5d55-4a17-ad0c-65f7a397c409",
      params: templateparams,
    }),
    // message: JSON.stringify({
    //   image: {
    //     link: "https://fss.gupshup.io/0/public/0/0/gupshup/15557836778/76a7e374-aed6-4e74-8789-e208ec70ab8f/1754066475613_WhatsApp%20Image%202025-08-01%20at%2022.09.00_30633e96.jpg",
    //   },
    //   type: "image",
    // }),
  });

  const headers = {
    "Cache-Control": "no-cache",
    "Content-Type": "application/x-www-form-urlencoded",
    apikey: "1uycnhio0owyjfm9nujcwgm0i3go289m",
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log("Message sent:", response.data);
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response?.data || error.message
    );
  }
}

