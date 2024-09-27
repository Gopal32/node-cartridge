const createCourse= require('./index')

const courseData = {
  courseTitle: 'Sample Course',
  content: 'This is a sample course description.',
  author: 'John Doe',
  chapters: [
    {
      chapterId: 'chapter1',
      chapterName: 'Introduction',
      lessons: [
        {
          lessonId: 'lesson1',
          lessonName: 'Lesson 1',
          content: '<p>This is the content for Lesson 1</p>'
        }
      ]
    }
  ]
};

const filePath = 'cartridge/';

// Call the function to generate the package
createCourse(courseData, filePath)
  .then(() => console.log('Package created successfully'))
  .catch(err => console.error('Error creating package:', err));
