import { auth, db } from "../../app/views/home.html"; // Import auth & db from a shared config file

const boxContainer = new BoxContainer('box-container', auth, db);
boxContainer.generateBoxes(48);
