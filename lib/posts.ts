// lib/posts.ts

// Import the full blog data, which is generated at build time.
// This file contains the frontmatter and the full markdown content for every post.
import postsData from './blog-data.json';

/**
 * Defines the structure for a blog post's author metadata.
 */
export interface Author {
  name: string;
  avatar?: string;
  bio: string;
}

/**
 * Defines the structure of the frontmatter metadata for each blog post.
 */
export interface PostFrontmatter {
  title: string;
  date: string; // Should be an ISO 8601 date string (e.g., "2023-10-26T00:00:00.000Z")
  description: string;
  author?: Author | Author[];
  tags?: string[];
  excerpt?: string;
}

/**
 * Represents the metadata of a blog post, including the slug.
 * This is typically used for listing posts without their full content.
 */
export interface BlogPost extends PostFrontmatter {
  slug: string;
}

/**
 * Represents a complete blog post, including its slug, frontmatter, and markdown content.
 * This is the structure of the objects in the imported blog-data.json.
 */
export interface FullBlogPost extends BlogPost {
  content: string;
}

/**
 * Type guard to ensure the imported JSON data conforms to our expected type.
 * In a real-world scenario, you might add more robust validation here.
 */
const allPosts: FullBlogPost[] = postsData;

/**
 * Returns a sorted list of all blog post metadata (without the content).
 * Reads from the pre-built manifest and does NOT use the file system at runtime.
 * Ideal for blog listing pages where full content is not needed.
 * @returns {BlogPost[]} An array of blog post metadata objects, sorted by date.
 */
export function getBlogPosts(): BlogPost[] {
  // The posts are already sorted by the build script.
  // We exclude the 'content' property to keep the data payload small.
  return allPosts.map(({ content, ...meta }) => meta);
}

/**
 * Returns an array of slug objects for all blog posts.
 * This is specifically formatted for use with Next.js's `generateStaticParams`.
 * @returns {{ slug: string }[]} An array of objects, each containing a post's slug.
 */
export function getAllPostSlugs(): { slug: string }[] {
  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Retrieves a single, complete blog post by its slug.
 * This function is synchronous and reads from the pre-built JSON manifest.
 * It is serverless-friendly as it avoids runtime file system access or network requests.
 *
 * @param {string} slug - The slug of the post to retrieve.
 * @returns {{ data: PostFrontmatter; content: string } | null} An object containing the post's
 * frontmatter (`data`) and markdown `content`, or `null` if the post is not found.
 */
export function getPostBySlug(
  slug: string
): { data: PostFrontmatter; content: string } | null {
  const post = allPosts.find((p) => p.slug === slug);

  if (!post) {
    return null;
  }
  
  // Destructure the post object to separate the markdown content
  // from the rest of the metadata (frontmatter).
  const { content, ...data } = post;

  return { data, content };
}