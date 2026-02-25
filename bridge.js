const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

// מאפשר לאתר שלך (שנמצא ב-Firebase) לדבר עם השרת הזה
app.use(cors());
app.use(express.json());

// שינינו ל-POST ולנתיב הראשי "/" כדי שיתאים לאתר
app.post("/", async (req, res) => {
  // האתר שולח את המספר בתוך ttID בגוף הבקשה (body)
  const mosadId = req.body.ttID;
  
  if (!mosadId) {
    return res.status(400).send("Missing ttID");
  }

  try {
    const response = await axios.get("https://www.matara.pro/nedarimplus/online/Files/Manage.aspx", {
      params: {
        Action: "GetMosad", 
        MosadId: mosadId,   
        S: "",
        _: Date.now(),
      },
      headers: {
        // הכותרות האלו גורמות לנדרים פלוס לחשוב שזה דפדפן אמיתי
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": `https://www.matara.pro/nedarimplus/online/?mosad=${mosadId}`,
        "Cookie": "_ga=GA1.2.1351829300.1710013894; ASP.NET_SessionId=;"
      },
    });

    // מחזיר את הנתונים ישירות לאתר שלך
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching from Nedarim:", error.message);
    res.status(500).send("Error fetching data");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bridge server is running on port ${PORT}`);
});
