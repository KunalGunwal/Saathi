import { text } from "express";
import nodemailer from "nodemailer"

const sendEmail = async (sender, senderpassword, reciever, subject, description) =>{
    console.log(reciever)

    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:sender,
            pass:senderpassword
        }
    })

    const mailOptions = {
        from: sender,
        to: reciever,
        subject: subject,
        text:description,
    }

    await transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
            console.log("error in sending mail", err)
        }
        else{
            console.log("email sent", info.response)
        }
    })
}

export default sendEmail