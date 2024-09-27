const { v4: uuidv4 } = require('uuid')
const { create } = require('xmlbuilder')
const { htmlToText } = require('html-to-text')
const fs = require('fs')
const path = require('path')

class CoursePackage {
  constructor(courseData, filePath) {
    this.courseData = courseData;
    this.filePath = filePath;
  }

  async generatePackage() {
    try {
      const manifest = this.createManifest();
      const organizations = this.addOrganizations(manifest);
      const resources = this.addResources(manifest);

      await this.createCourseSettings(resources);
      await this.createHTMLFile();

      if (this.courseData.chapters.length > 0) {
        await this.addChaptersAndLessons(organizations, resources);
      }

      await this.writeManifestFile(manifest);
    } catch (err) {
      throw new Error(`Error generating Common Cartridge: ${err.message}`);
    }
  }

  // Create Manifest Structure
  createManifest() {
    const manifest = create('manifest', { encoding: 'UTF-8' })
      .att('identifier', 'com.example.course')
      .att('xmlns', 'http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1')
      .att('xmlns:lom', 'http://ltsc.ieee.org/xsd/imsccv1p1/LOM/resource')
      .att('xmlns:lomimscc', 'http://ltsc.ieee.org/xsd/imsccv1p1/LOM/manifest')
      .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
      .att('xsi:schemaLocation', 'http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1 http://www.imsglobal.org/profile/cc/ccv1p1/ccv1p1_imscp_v1p2_v1p0.xsd http://ltsc.ieee.org/xsd/imsccv1p1/LOM/resource http://www.imsglobal.org/profile/cc/ccv1p1/LOM/ccv1p1_lomresource_v1p0.xsd http://ltsc.ieee.org/xsd/imsccv1p1/LOM/manifest http://www.imsglobal.org/profile/cc/ccv1p1/LOM/ccv1p1_lommanifest_v1p0.xsd')

    const metadata = manifest.ele('metadata')
    metadata.ele('schema').txt('IMS Common Cartridge')
    metadata.ele('schemaversion').txt('1.1.0')
    metadata.ele('title').txt(htmlToText(this.courseData.courseTitle) || '')
    metadata.ele('author').txt(this.courseData.author || '')
    metadata.ele('language').txt('en')
    metadata.ele('description').txt(htmlToText(this.courseData.courseDescription) || '')
    metadata.ele('version').txt('1.0')

    return manifest
  }

  addOrganizations(manifest) {
    const organizations = manifest.ele('organizations');
    organizations.ele('organization', { identifier: 'org_1', structure: 'rooted-hierarchy' });
    return organizations;
  }

  addResources(manifest) {
    const resources = manifest.ele('resources');
    return resources;
  }

  async createCourseSettings(resources) {
    const courseSettingId = uuidv4();
    const courseSettingXml = create('course', { encoding: 'UTF-8' })
      .att('identifier', courseSettingId)
      .att('xmlns', 'http://canvas.instructure.com/xsd/cccv1p0')
      .att('xmlns:lom', 'http://ltsc.ieee.org/xsd/imsccv1p1/LOM/resource')
      .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
      .att('xsi:schemaLocation', 'http://canvas.instructure.com/xsd/cccv1p0 http://canvas.instructure.com/xsd/cccv1p0.xsd')

    courseSettingXml.ele('title').txt(htmlToText(this.courseData.courseTitle));
    courseSettingXml.ele('default_wiki_editing_roles').txt('teachers');
    courseSettingXml.ele('allow_student_organized_groups').txt(false);
    courseSettingXml.ele('default_view').txt('wiki');
    courseSettingXml.ele('open_enrollment').txt(false);
    courseSettingXml.ele('self_enrollment').txt(false);

    resources.ele('resource', {
      identifier: courseSettingId,
      type: 'associatedcontent/imscc_xmlv1p1/learning-application-resource',
      href: 'course_settings/canvas_export.txt'
    });


    resources.ele('resource', {
      identifier: this.courseData.courseId,
      type: 'webcontent',
      href: 'wiki_content/front-page.html'
    }).ele('file', { href: 'wiki_content/front-page.html' })

    await this.writeFileAsync(`${this.filePath}/course_settings/course_settings.xml`, courseSettingXml.end({ pretty: true }));
    await this.writeFileAsync(`${this.filePath}/course_settings/canvas_export.txt`, '');
  }

  async createHTMLFile() {
    const htmlContent = `
    <html>
      <head>
        <title>${htmlToText(this.courseData.courseTitle)}</title>
        <meta name="identifier" content="${this.courseData.courseId}"/>
        <meta name="editing_roles" content="teachers"/>
        <meta name="workflow_state" content="active"/>
        <meta name="front_page" content="true"/>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h1 { color: #4169E1; }
        </style>
      </head>
      <body>
        <h1>${htmlToText(this.courseData.courseTitle)}</h1>
        ${this.courseData.content}
      </body>
    </html>`;

    await this.writeFileAsync(path.join(this.filePath, '/wiki_content/front-page.html'), htmlContent);
  }

  async addChaptersAndLessons(organizations, resources) {
    const learningModule = organizations.ele('item', { identifier: 'LearningModules' });
    const moduleMetaXml = create('modules', { encoding: 'UTF-8' })
      .att('xmlns', 'http://canvas.instructure.com/xsd/cccv1p0')
      .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
      .att('xsi:schemaLocation', 'http://canvas.instructure.com/xsd/cccv1p0 http://canvas.instructure.com/xsd/cccv1p0.xsd')

    for (let i = 0; i < this.courseData.chapters.length; i++) {
      const chapter = this.courseData.chapters[i];
      const chapterModule = moduleMetaXml.ele('module', { identifier: chapter.chapterId })
        .ele('title').txt(htmlToText(chapter.chapterName || '')).up()
        .ele('workflow_state').txt('active').up()
        .ele('position').txt(i).up()
        .ele('unlock_at').txt(chapter.createdOn || '').up()
        .ele('require_sequential_progress').txt('false').up()
        .ele('locked').txt('false').up()

      const chapterItem = learningModule.ele('item', { identifier: chapter.chapterId });
      chapterItem.ele('title').txt(htmlToText(chapter.chapterName || ''));

      if (chapter.lessons.length > 0) {
        const lessonModule = chapterModule.ele('items');
        for (let j = 0; j < chapter.lessons.length; j++) {
          const lesson = chapter.lessons[j];
          const lessonId = uuidv4();
          lessonModule.ele('item', { identifier: lesson.lessonId })
            .ele('content_type').txt('WikiPage').up()
            .ele('workflow_state').txt('active').up()
            .ele('title').txt(htmlToText(lesson.lessonName || '')).up()
            .ele('identifierref').txt(lessonId).up()
            .ele('position').txt(j).up()
            .ele('new_tab').up()
            .ele('indent').txt('0').up()

          const lessonFile = `wiki_content/${htmlToText(lesson.lessonName).replace(/\s+/g, '-')}-${i}${j}.html`;

          const lessonContent = this.createLessonContent(lesson, lessonId);
          await this.writeFileAsync(path.join(this.filePath, lessonFile), lessonContent);

          chapterItem.ele('item', { identifier: lesson.lessonId, identifierref: lessonId })
            .ele('title').txt(htmlToText(lesson.lessonName));

          resources.ele('resource', {
            identifier: lessonId,
            type: 'webcontent',
            href: lessonFile
          }).ele('file', { href: lessonFile });
        }
      }
    }

    await this.writeFileAsync(`${this.filePath}/course_settings/module_meta.xml`, moduleMetaXml.end({ pretty: true }));
  }

  createLessonContent(lesson, lessonId) {
    return `
    <html>
      <head>
        <title>${htmlToText(lesson.lessonName)}</title>
        <meta name="identifier" content="${lessonId}"/>
        <meta name="editing_roles" content="teachers"/>
        <meta name="workflow_state" content="active"/>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h1 { color: #4169E1; }
        </style>
      </head>
      <body>
        ${lesson.content}
      </body>
    </html>`;
  }

  async writeManifestFile(manifest) {
    await this.writeFileAsync(path.join(this.filePath, 'imsmanifest.xml'), manifest.end({ pretty: true }));
  }

  // Helper function to write files asynchronously
  async writeFileAsync(filePath, content) {
    try {
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, content);
    } catch (err) {
      throw new Error(`Error writing file ${filePath}: ${err.message}`);
    }
  }
}

module.exports = CoursePackage;
