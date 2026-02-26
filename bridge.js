const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
  const mosadId = req.body.ttID;
  
  if (!mosadId) {
    return res.status(400).send("Missing ttID");
  }

  try {
    // שלב 1: קבלת הגדרות המסוף וחילוץ מזהה הקמפיין (Matching ID)
    const mosadRes = await axios.get("https://www.matara.pro/nedarimplus/online/Files/Manage.aspx", {
      params: { Action: "GetMosad", MosadId: mosadId, S: "", _: Date.now() },
      headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
      }
    });

    let matchingId = "";
    if (mosadRes.data && mosadRes.data.Matching) {
        // מחלץ את המספר האמצעי מתוך המחרוזת "Nedarim:907:1:24::1:1"
        matchingId = mosadRes.data.Matching.split(":")[1]; 
    }

    if (!matchingId) {
        return res.status(400).send({ error: "No active matching campaign found for this Mosad." });
    }

    // שלב 2: קבלת היעד והסכום הכללי של הקמפיין
    const goalRes = await axios.get(`https://www.matara.pro/nedarimplus/V6/MatchPlus.aspx?Action=ShowGoal&MatchingId=${matchingId}`);
    
    // שלב 3: קבלת רשימת השגרירים (הסכום שנאסף אצלם נקרא Cumule)
    const donorsRes = await axios.get(`https://www.matara.pro/nedarimplus/V6/MatchPlus.aspx?Action=SearchMatrim&Name=&MosadId=${mosadId}`);

    // אריזת הנתונים למבנה מסודר שהאתר שלך יאהב
    const finalData = {
        CampaignGoal: goalRes.data.Goal || 0,
        TotalAmount: goalRes.data.Donated || 0,
        Donors: donorsRes.data || [] // מערך של השגרירים
    };

    res.send(finalData);

  } catch (error) {
    console.error("Error fetching from Nedarim:", error.message);
    res.status(500).send({ error: "Error fetching data from external API" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Advanced Bridge server is running on port ${PORT}`);
});
