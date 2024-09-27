# NODE-CARTRIDGE

A Node.js library for generating Common Cartridge course packages.


## Description

Common Cartridge Course Generator is a Node.js library designed to make it easy to generate Common Cartridge (CC) packages for courses, including chapters, lessons, and content. The API is simple and flexible, providing both low-level functions and high-level abstractions to streamline the process. Whether you're exporting courses for use in an LMS like Moodle or Canvas, this tool makes creating standard-compliant packages a breeze.

Check out the usage examples and documentation below to see how easily you can generate your own course packages!

## Installation

Installation uses the [npm](http://npmjs.org/) package manager. Just type the following command after installing npm.

    npm install node-cartridge

## Features

- Structured Course Generation: Define courses with multiple chapters and lessons.
- JSON Input: Accepts JSON input for seamless integration with different data sources.
- Common Cartridge Format: Output is in a standard Common Cartridge format, which is widely supported by LMS platforms.
- Error Handling: Built-in error handling to ensure the generation process is smooth.
- Flexible Output Location: Specify the output path where the package will be saved.

## Coming Soon!

- Additional formats: More LMS-specific package formats (e.g., SCORM).
- Content validation: Check for missing or invalid content before generating the package.

## Example

Here's a basic example of how to use the package:

```javascript

const createCoursePackage = require('node-cartridge');
const path = require('path');

// Define course structure
const courseData = {
  courseTitle: 'JavaScript Basics',
  courseDescription: 'A comprehensive introduction to JavaScript',
  author: 'John Doe',
  chapters: [
    {
      chapterId: '1',
      chapterName: 'Getting Started',
      lessons: [
        {
          lessonId: '1.1',
          lessonName: 'Introduction to JavaScript',
          content: '<p>Learn about the basics of JavaScript</p>'
        },
        {
          lessonId: '1.2',
          lessonName: 'Variables and Data Types',
          content: '<p>Understanding variables and data types in JavaScript</p>'
        }
      ]
    }
  ]
};

// Specify the output path for the Common Cartridge package
const outputPath = path.join(__dirname, 'output', 'course-package');

// Generate the Common Cartridge package
createCoursePackage(courseData, outputPath)
  .then(() => console.log('Package created successfully'))
  .catch(err => console.error('Error creating package:', err));
```

## Output

The generated Common Cartridge package will be saved at the specified output path (e.g., output/course-package). The package can then be imported into an LMS that supports the Common Cartridge standard.


## Features Overview
1. Course Structure
Create detailed courses with chapters and lessons.
Each chapter can have multiple lessons, and each lesson can have its own content.
2. Text and Content Embedding
Easily embed HTML content into lessons.
Use your existing content structure and format it for Common Cartridge output.
3. Output Format
Generates a zip package in the Common Cartridge format, suitable for LMS platforms.
4. Error Handling
Errors during package generation will be caught and returned in the promise rejection for easy debugging.

## Additional Features

- HTML Embedding: Embed HTML content within course lessons.
File Streaming: Stream output to a file system to save the generated package.
- Cross-LMS Support: Common Cartridge format is supported by popular platforms like Moodle, Canvas, Blackboard, and others.

## Browser Usage

While this package is designed for Node.js, you can use tools like Browserify or Webpack to bundle the library for use in a browser-based environment. This enables client-side course package generation, where course data can be assembled dynamically.

Here’s an example of how you might use the package in a browser:

```javascript
import createCoursePackage from 'node-cartridge';
import { saveAs } from 'file-saver';

// Define your course data as usual
const courseData = {
  courseTitle: 'Intro to Web Development',
  chapters: [{ chapterId: '1', chapterName: 'HTML Basics', lessons: [] }]
};

// Generate the course package in the browser
createCoursePackage(courseData)
  .then(blob => {
    // Use FileSaver to save the package locally
    saveAs(blob, 'course-package.zip');
  })
  .catch(err => console.error('Error creating package:', err));
```

## Dependencies for Browser Usage
- file-saver: A library to save files in the browser.
- Browserify/Webpack: Tools to bundle the Node.js library for browser use.

## Contributions

We welcome contributions from the community! If you find a bug or have a suggestion for a feature, feel free to open an issue or submit a pull request.

## License

Common Cartridge Course Generator is licensed under the MIT License. See the LICENSE file for details.

This README provides a high-level overview of how the package works, similar to the format used by PDFKit. It introduces the package, explains how to install and use it, lists the key features, and includes a code example.
