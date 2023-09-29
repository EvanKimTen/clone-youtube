import mongoose from "mongoose";
// connect between db and mongoose so that it recognizes
// data model.
const videoSchema = new mongoose.Schema({
    title: {type:String, required:true},
    description: {type:String, required:true},
    createdAt: { type: Date, required: true, default: Date.now },
    // default: 기본적으로 설정된 value
    hashtags: [{type: String}],
    meta: {
        views: {type: Number, default: 0, required: true},
        rating: {type: Number, default: 0, required: true},

    },
});

videoSchema.static("formatHashtags", function (hashtags) {
    return hashtags
      .split(",")
      .map((word) => (word.startsWith("#") ? word : `#${word}`));
      // which problem is being solved by solution of choosing cases to 
      // attach hashtags
});

// middleware must work before created

const Video = mongoose.model("Video", videoSchema);
export default Video;
// create model and export default.

//////// db -> aware that there's a model. by importing to the server.js


