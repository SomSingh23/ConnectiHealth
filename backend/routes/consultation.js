const express = require("express");
let jwt = require("jsonwebtoken");
let User = require("../database/user");
let PatientRequestDoctor = require("../database/patientRequestDoctor");
let sendEmail = require("../email/sendMail");
let template = require("../email/template");
const router = express.Router();
require("dotenv").config();

router.get("/", (req, res) => {
  res.send("Consulation Api running :)");
});
router.post("/getdoctor", async (req, res) => {
  try {
    let token = req.body.token;
    let data = jwt.decode(req.body.token);
    let patientEmail = data.email;
    let requestDoctorData = await PatientRequestDoctor.findOne({
      email: patientEmail,
    });
    let doctors = await User.find({ role: "doctor" });
    if (requestDoctorData === null) {
      return res.status(200).json({
        doctors,
      });
    }
    doctors = doctors.filter((doctor) => {
      return !requestDoctorData.reqeustDoctors.includes(doctor.uuid);
    });
    return res.status(200).json({ doctors });
  } catch (err) {
    console.log(err);
    return res.status(200).json({
      doctors: [],
    });
  }
});

router.post("/request/:id", async (req, res) => {
  try {
    let token = req.body.token;
    let data = jwt.decode(req.body.token);
    let patientEmail = data.email;
    let patinetRequests = await PatientRequestDoctor.findOne({
      email: patientEmail,
    });

    if (patinetRequests === null) {
      // 1st Request
      console.log("1st Request");
      let arr = [req.params.id];
      let newRequest = new PatientRequestDoctor({
        email: patientEmail,
        reqeustDoctors: arr,
      });
      await newRequest.save();
    } else {
      // after 1st Request
      let newArrayOfRequest = patinetRequests.reqeustDoctors;
      newArrayOfRequest.push(req.params.id);
      await PatientRequestDoctor.findOneAndUpdate(
        { email: patientEmail },
        { reqeustDoctors: newArrayOfRequest }
      );
    }
    let doctorEmail = await User.findOne({ uuid: req.params.id });

    doctorEmail = doctorEmail.email;

    await sendEmail(template, doctorEmail);
    console.log("Mail Sent");
    res.status(200).send("Mail Sent");
  } catch (err) {
    console.log(err);
    res.status(200).send("Mail Not Sent");
  }
});
module.exports = router;
