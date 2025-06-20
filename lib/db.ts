import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () =>{
    const connectionstate =mongoose.connection.readyState ;
 
    if (connectionstate === 1){
        console.log("already connected");
        return ;
    }

    if ( connectionstate === 2){
        console.log("connecting...");
        return ;
    }

    try {
        mongoose.connect(MONGODB_URI!,{
            dbName:`Jrnl`, //provide correct db name while changing this template
            bufferCommands: true
        })
        console.log("conntected");
    } catch (error) {
        console.log ("error:",error);
        // throw new Error ("error:",error);
     
    }
};
export default connect ;