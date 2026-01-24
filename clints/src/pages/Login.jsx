import API from "../services/api";

const login = async () => {
  const res = await API.post("/login", {
    email,
    password
  });
};import API from "../services/api";

const login = async () => {
  const res = await API.post("/login", {
    email,
    password
  });
};