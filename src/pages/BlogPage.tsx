import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const BlogPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Form states for new/edit post
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  const ADMIN_EMAIL = 'philosncube@gmail.com';

  useEffect(() => {
    checkUser();
    fetchPosts();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching all posts:', error);
    }
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleSavePost = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.substring(0, 200) + '...',
        author: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Eugene',
        author_email: user.email,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        published,
        updated_at: new Date().toISOString()
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
      }

      // Reset form
      setTitle('');
      setContent('');
      setExcerpt('');
      setTags('');
      setPublished(false);
      setEditingPost(null);
      setShowEditor(false);

      // Refresh posts
      if (isAdmin) {
        fetchAllPosts();
      } else {
        fetchPosts();
      }

      alert(editingPost ? 'Post updated successfully!' : 'Post created successfully!');
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setExcerpt(post.excerpt);
    setTags(post.tags.join(', '));
    setPublished(post.published);
    setShowEditor(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      if (isAdmin) {
        fetchAllPosts();
      } else {
        fetchPosts();
      }

      alert('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. Please try again.');
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !post.published })
        .eq('id', post.id);

      if (error) throw error;

      if (isAdmin) {
        fetchAllPosts();
      } else {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post. Please try again.');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = [...new Set(posts.flatMap(post => post.tags))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllPosts();
    }
  }, [isAdmin]);

  if (showEditor) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url(/images/bg_image.png)' }}
      >
        <div className="min-h-screen bg-black/10">
          <Navbar />
          <div className="pt-20 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 border border-white/30">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-white">
                    {editingPost ? 'Edit Post' : 'Create New Post'}
                  </h1>
                  <button
                    onClick={() => {
                      setShowEditor(false);
                      setEditingPost(null);
                      setTitle('');
                      setContent('');
                      setExcerpt('');
                      setTags('');
                      setPublished(false);
                    }}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-black/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter post title..."
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Excerpt (Optional)
                    </label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-black/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Brief description of the post..."
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Content *
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={15}
                      className="w-full px-4 py-3 bg-black/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Write your post content here... (Markdown supported)"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full px-4 py-3 bg-black/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="AI, Technology, Productivity..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="published"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="mr-3 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="published" className="text-white/80">
                      Publish immediately
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleSavePost}
                      disabled={saving}
                      className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : (editingPost ? 'Update Post' : 'Save Post')}
                    </button>
                    <button
                      onClick={() => {
                        setShowEditor(false);
                        setEditingPost(null);
                      }}
                      className="bg-gray-500/50 hover:bg-gray-500/70 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white sm:text-5xl mb-4">
                Entropy Blog
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Insights, tutorials, and thoughts on AI, productivity, and technology
              </p>
            </div>

            {/* Admin Controls */}
            {isAdmin && (
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 mb-8">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Admin Panel</h2>
                  <button
                    onClick={() => setShowEditor(true)}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
                  >
                    + New Post
                  </button>
                </div>
              </div>
            )}

            {/* Search and Filter */}
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search posts..."
                    className="w-full px-4 py-3 bg-black/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="md:w-48">
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">All Tags</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-white/80 mt-4">Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold text-white mb-4">No posts found</h3>
                <p className="text-white/80">
                  {posts.length === 0 ? 'No blog posts have been published yet.' : 'Try adjusting your search or filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white/20 backdrop-blur-md rounded-xl border border-white/30 overflow-hidden hover:bg-white/30 transition-all duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">
                            {post.title}
                          </h2>
                          <p className="text-white/60 text-sm">
                            By {post.author} • {formatDate(post.created_at)}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="text-emerald-300 hover:text-emerald-200 text-sm"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => togglePublished(post)}
                              className={`text-sm ${post.published ? 'text-green-300' : 'text-yellow-300'}`}
                              title={post.published ? 'Published' : 'Draft'}
                            >
                              {post.published ? '👁️' : '📄'}
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-300 hover:text-red-200 text-sm"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-white/80 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <Link
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center text-emerald-300 hover:text-emerald-200 font-medium transition-colors"
                      >
                        Read More →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;