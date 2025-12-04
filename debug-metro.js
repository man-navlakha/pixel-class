try {
    const config = require('./metro.config.js');
    console.log("Successfully loaded metro.config.js");
} catch (e) {
    console.error("Error loading metro.config.js:");
    console.error(e);
}
