// scripts/build-blog-data.mjs
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define the directory where your markdown posts are located
const postsDirectory = path.join(process.cwd(), 'public', 'blog');

// Define the path for the output JSON file
const outputFile = path.join(process.cwd(), 'lib', 'blog-data.json');

function generateBlogData() {
  console.log('🔍 Starting to generate full blog data...');

  try {
    const fileNames = fs.readdirSync(postsDirectory);

    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        // Create a slug by removing the ".md" extension
        const slug = fileName.replace(/\.md$/, '');

        // Construct the full path to the markdown file
        const fullPath = path.join(postsDirectory, fileName);

        // Read the file's content
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post's metadata (data) and content
        const { data, content } = matter(fileContents);

        // Validate that essential frontmatter exists
        if (!data.date || !data.title) {
          throw new Error(
            `Post "${fileName}" is missing required frontmatter: title or date.`
          );
        }
        
        // Return a complete post object
        return {
          slug,
          content, // Include the full markdown content
          ...data,
        };
      });

    // Sort posts by date in descending order (newest first)
    const sortedPosts = allPostsData.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    });

    // Write the sorted posts data to the output JSON file
    fs.writeFileSync(outputFile, JSON.stringify(sortedPosts, null, 2));

    console.log(`✅ Successfully generated blog data for ${sortedPosts.length} posts at: ${outputFile}`);

  } catch (error) {
    console.error('❌ Error generating blog data:', error);
    // Exit the process with an error code to fail the build
    process.exit(1); 
  }
}

// Execute the function
generateBlogData();