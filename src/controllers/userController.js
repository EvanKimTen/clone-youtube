import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch"; // node-fetch not supported --> Babel recognizes import as require.. why?
// command to go
// --> npm uninstall node-fetch and npm install node-fetch@2

export const getJoin = (req, res) => res.render("join", {pageTitle: "Join"});
export const postJoin = async (req, res) => {
    const { name, username, email, password, password2 } = req.body;
    const pageTitle = "Join";
    if (password !== password2) {
        return res.status(400).render("join", {
          pageTitle,
          errorMessage: "Password confirmation does not match.",
        });
    }
    const exists = await User.exists({ $or: [{ username }, { email }] });
    if (exists) {
        return res.status(400).render("join", {
        pageTitle,
        errorMessage: "This username/email is already taken.",
        });
    }
    try {
        await User.create({
            name,
            username,
            email,
            password,
        });
        return res.redirect("/login");
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
};
export const getLogin = (req, res) => res.render("login", {pageTitle: "Login"});
export const postLogin = async (req, res) => {
    const {username, password} = req.body;
    const user = await User.findOne({ username, socialOnly: false });
    const pageTitle = "Login";
    // check if username exists.
    if (!user) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "An account with this username does not exist.",
        });
    }
    // check if password correct ??
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "Wrong Password",
        }); 
    }
    req.session.loggedIn = true;
    req.session.user = user;
    res.redirect("/");
}
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
}
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl }, // before updated and avatarUrl to be saved on the DB INSTEAD OF FILE ITSELF.
    },
    body: { name, email, username },
    file,
  } = req;
  console.log(file);
  const user = await User.findById(_id);

  const exists = await User.exists({ $or: [{ username }, { email }] });
  
  if (!exists || (username != user.username || email != user.email)) {
    const updatedUser = await User.findByIdAndUpdate(_id, {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
    }, {new: true} ); // third arg: to become optional OBJECT for after update applied

    req.session.user = updatedUser;
    return res.redirect("/users/edit"); // post request AND get back into with GET request.
  } 
  
  return res.status(400).render("edit-profile", { // status code recap again
    pageTitle: "Edit Profile",
    errorMessage: "This username/email is already taken.",
    }); 
    
};
// however, what happens if the username/email you updated to is already taken? (like postJoin function)
// --> should work on that for myself: CODE CHALLENGE
// 1. how to compare users except for himself? --> Just use find() function to get user's info

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  // send notification
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPassword != newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "Sorry. The new password can't be confirmed.",
    });
  }
  user.password = newpassWord;
  await user.save();
  return res.redirect("/users/logout");
};

export const remove = (req, res) => res.send("Remove User");


export const startGithubLogin = (req, res) => { // 1 for github
    const baseURL = "https://github.com/login/oauth/authorize"
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    };
    
    const params = new URLSearchParams(config).toString();
    console.log(params);
    const finalUrl = `${baseURL}?${params}`; // result of adding up all these stuff above
    return res.redirect(finalUrl);
}

export const finishGithubLogin = async (req, res) => { // ERROR: doesn't redirect back to home...
  // need for recap to 21/22 lecture.
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
      client_id: process.env.GH_CLIENT,
      client_secret: process.env.GH_SECRET,
      code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
      await fetch(finalUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      })
    ).json(); // you fetch to send post request to finalURL then get the data using json.

    if ("access_token" in tokenRequest) { // 이 경우는 GH내에서 signup여부 확인하는 건가?
      // from the scope --> GH gives code contained in config of finalurl
      // --> exchange it for access token.
      const { access_token } = tokenRequest;
      const apiUrl = "https://api.github.com";
      const userData = await (
        await fetch(`${apiUrl}/user`, {
          headers: {
            Authorization: `token ${access_token}`, // header가 response에 해당한다고 한다. 정확히 뭔 뜻임?
          },
        })
      ).json();
      console.log(userData);
      const emailData = await (
        await fetch(`${apiUrl}/user/emails`, { // 이것도 역시 docs를 참고해서 링크 알아냄.
          headers: {
            Authorization: `token ${access_token}`,
          },
        })
      ).json();
      const emailObj = emailData.find(
        (email) => email.primary === true && email.verified === true
      );
      if (!emailObj) {
        return res.redirect("/login");
      }
      
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
          name: userData.name,
          username: userData.login,
          email: emailObj.email,
          password: "",
          socialOnly: true,
          
        });
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
      }
    } else {
      return res.redirect("/login");
    }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
}

// whole idea: 
// 1. user to Github
// 2. Yes --> get the code from GH
// 3. GH code to access token(back to website)
// 4. use API with this token -> fetch data of GH user

export const see = (req, res) => res.send("See User");