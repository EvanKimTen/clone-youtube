import Video from "../models/Video";


export const home = async (req, res) => {
  const videos = await Video.find({}); // and asc and desc for sort method.
  console.log(req.session);
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const id = req.params.id;
  const video = await Video.findById(id);
  if (video === null) {
    return res.status(404).render("404", {pageTitle: "Video Not Found."});
  }
  return res.render("watch", {pageTitle: `${video.title}`, video});
};
export const getEdit = async (req, res) => {
  const id = req.params.id;
  const video = await Video.findById(id); // video object를 pug파일에 보내야해서 findByID를 쓴 것
  if (video === null) {
    return res.render("404", {pageTitle: "Video Not Found."});
  }
  return res.render("edit", {pageTitle: `Editing ${video.title}`, video});
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {title, description, hashtags} = req.body;
  const video = await Video.exists({ _id: id }); // boolean to tell if id exists or not.
  if (!video) { // if video doesn't exist.
    return res.status(404).render("404", {pageTitle: "Video Not Found."});
  }
  await Video.findByIdAndUpdate(id, {
    title, description, 
    hashtags:Video.formatHashtags(hashtags),
  })
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  // here we will add a video to the videos array.
  const { title, description, hashtags } = req.body;
  try {
    await Video.create ({
      title,
      description,
      hashtags:Video.formatHashtags(hashtags),
    });
  } catch(error) {
    return res.render("upload", { pageTitle: "Upload Video", 
    errorMessage: error._message });
  }
  
    // returns promise
  // gonna spend a bit of time.
  return res.redirect("/"); //
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  await Video.findByIdAndDelete(id); // as you know
  // mongoose function.
  // to delete one on the database.
  // remove's not mentioned.
  return res.redirect("/");
};

export const search = async (req, res) =>{
  // req.query: Only name of form
  const {keyword} = req.query;
  let videos = [];
  if (keyword) {
    // search
    videos = await Video.find({
      title: {
        $regex: new RegExp(`${keyword}$`, "i"), // ignore case
        // search for words containing title.
        // ^${keywords} --> beginning with keyword
        // ${keywords}& --> ending with ll 
        // MongoDB is working
        // one of the evaluation query operation
      },
    });
  }
  res.render("search", {pageTitle: "Search", videos})
  res.send()
}