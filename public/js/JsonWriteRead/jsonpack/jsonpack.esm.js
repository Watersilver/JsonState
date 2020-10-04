// Import and clean global namespace
import "./jsonpack-master/main.js";
const jsonpack = window.jsonpack;
delete window.jsonpack;

export default jsonpack;