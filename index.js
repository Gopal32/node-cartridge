const CoursePackage = require('./src/Course')

/**
 * createCoursePackage
 * @param {Object} courseData - The structured data representing the course, including chapters and lessons.
 * @param {String} filePath - The directory path where the Common Cartridge package will be saved.
 * @returns {Promise<void>} - A promise that resolves once the package has been successfully generated.
 */
module.exports = async (courseData, filePath) => {
  try {
    const coursePackage = new CoursePackage(courseData, filePath);
    await coursePackage.generatePackage();
    console.log(`Common Cartridge package generated successfully at: ${filePath}`);
  } catch (err) {
    console.error(`Error generating Common Cartridge package: ${err.message}`);
    throw err; // Re-throw the error to allow handling by the calling code
  }
};
