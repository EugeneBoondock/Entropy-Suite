import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  author_email: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  tags: string[];
  featured_image?: string;
}

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  const ADMIN_EMAIL = 'philosncube@gmail.com';

  useEffect(() => {
    checkUser();
    if (id) {
      fetchPost();
    }
  }, [id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if post is published or if user is admin
      if (!data.published && user?.email !== ADMIN_EMAIL) {
        navigate('/blog');
        return;
      }

      setPost(data);
      
      // Fetch related posts
      if (data.tags.length > 0) {
        const { data: related } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .neq('id', id)
          .limit(3);

        if (related) {
          // Filter posts that share at least one tag
                     const relatedByTags = related.filter(relatedPost =>
             relatedPost.tags.some((tag: string) => data.tags.includes(tag))
           );
          setRelatedPosts(relatedByTags.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-black/20 px-2 py-1 rounded text-blue-200">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url(/images/bg_image.png)' }}
      >
        <div className="min-h-screen bg-black/10">
          <Navbar />
          <div className="pt-20 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-white/80 mt-4">Loading post...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url(/images/bg_image.png)' }}
      >
        <div className="min-h-screen bg-black/10">
          <Navbar />
          <div className="pt-20 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-12">
                <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
                <p className="text-white/80 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
                <Link
                  to="/blog"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Back to Blog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/bg_image.png)' }}
    >
      <div className="min-h-screen bg-black/10">
        <Navbar />
        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <div className="mb-8">
              <Link
                to="/blog"
                className="inline-flex items-center text-white/80 hover:text-white transition-colors"
              >
                ← Back to Blog
              </Link>
            </div>

            {/* Main Article */}
            <article className="bg-white/20 backdrop-blur-md rounded-xl border border-white/30 overflow-hidden mb-12">
              {/* Header */}
              <div className="p-8 border-b border-white/20">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    {!post.published && (
                      <div className="inline-block bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        Draft
                      </div>
                    )}
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      {post.title}
                    </h1>
                    <div className="flex items-center text-white/60 text-sm">
                      <span>By {post.author}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(post.created_at)}</span>
                      {post.updated_at !== post.created_at && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Updated {formatDate(post.updated_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 ml-4">
                      <Link
                        to={`/blog/edit/${post.id}`}
                        className="bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Edit Post
                      </Link>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/30 text-blue-100 text-sm rounded-full border border-blue-400/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8">
                <div 
                  className="prose prose-invert max-w-none text-white/90 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: `<p class="mb-4">${formatContent(post.content)}</p>` 
                  }}
                />
              </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white/20 backdrop-blur-md rounded-xl border border-white/30 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Related Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.id}`}
                      className="block bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors"
                    >
                      <h3 className="text-white font-semibold mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-white/70 text-sm mb-3 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {relatedPost.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/30 text-blue-100 text-xs rounded-full border border-blue-400/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section (Future Enhancement) */}
            <div className="bg-white/20 backdrop-blur-md rounded-xl border border-white/30 p-8 mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Comments</h2>
              <p className="text-white/60">
                Comments feature coming soon! For now, feel free to reach out via the{' '}
                <Link to="/contact" className="text-blue-200 hover:text-blue-100">
                  contact page
                </Link>{' '}
                with your thoughts and feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage; 