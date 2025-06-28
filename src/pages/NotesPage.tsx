import React, { useState, useEffect } from 'react';
import { Search, Plus, Save, Edit3, Trash2, Calendar, Tag, Star, StarOff, BookOpen, Filter, SortAsc, SortDesc, Eye, EyeOff, PenTool, FileText, Heart, Coffee, Lightbulb, AlertCircle, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../utils/supabaseClient';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  mood?: string;
  weather?: string;
  user_id: string;
}

interface Category {
  name: string;
  icon: string;
  color: string;
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'updated'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  // New note form state
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'personal',
    tags: '',
    mood: '',
    weather: ''
  });

  const categories: Category[] = [
    { name: 'all', icon: '📝', color: 'text-gray-600' },
    { name: 'personal', icon: '❤️', color: 'text-pink-600' },
    { name: 'work', icon: '💼', color: 'text-blue-600' },
    { name: 'ideas', icon: '💡', color: 'text-yellow-600' },
    { name: 'travel', icon: '✈️', color: 'text-green-600' },
    { name: 'health', icon: '🏥', color: 'text-red-600' },
    { name: 'learning', icon: '📚', color: 'text-purple-600' },
    { name: 'goals', icon: '🎯', color: 'text-indigo-600' },
    { name: 'gratitude', icon: '🙏', color: 'text-amber-600' }
  ];

  const moods = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😔', label: 'Sad' },
    { emoji: '😡', label: 'Angry' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '🤔', label: 'Thoughtful' },
    { emoji: '😌', label: 'Peaceful' },
    { emoji: '🔥', label: 'Energetic' }
  ];

  const weatherOptions = [
    { emoji: '☀️', label: 'Sunny' },
    { emoji: '⛅', label: 'Cloudy' },
    { emoji: '🌧️', label: 'Rainy' },
    { emoji: '❄️', label: 'Snowy' },
    { emoji: '⛈️', label: 'Stormy' },
    { emoji: '🌫️', label: 'Foggy' }
  ];

  useEffect(() => {
    checkAuthAndLoadNotes();
  }, []);

  useEffect(() => {
    filterAndSortNotes();
  }, [notes, searchTerm, selectedCategory, sortBy, sortOrder]);

  const checkAuthAndLoadNotes = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        await loadNotes(session.user.id);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  // Encryption helper functions
  const encryptData = async (data: string, userId: string): Promise<string> => {
    try {
      const { data: result, error } = await supabase
        .rpc('encrypt_data', {
          data: data,
          encryption_key: await getUserEncryptionKey(userId)
        });
      
      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  };

  const decryptData = async (encryptedData: string, userId: string): Promise<string> => {
    try {
      const { data: result, error } = await supabase
        .rpc('decrypt_data', {
          encrypted_data: encryptedData,
          encryption_key: await getUserEncryptionKey(userId)
        });
      
      if (error) throw error;
      return result || '';
    } catch (error) {
      console.error('Decryption error:', error);
      return '';
    }
  };

  const getUserEncryptionKey = async (userId: string): Promise<string> => {
    try {
      const { data: result, error } = await supabase
        .rpc('get_user_encryption_key', { user_id: userId });
      
      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error getting encryption key:', error);
      throw new Error('Failed to get encryption key');
    }
  };

  const generateHash = (text: string): string => {
    // Simple hash for search functionality
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  };

  const loadNotes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Decrypt notes
      const decryptedNotes = await Promise.all(
        (data || []).map(async (note: any) => {
          try {
            const decryptedTitle = await decryptData(note.encrypted_title, userId);
            const decryptedContent = await decryptData(note.encrypted_content, userId);
            const decryptedTags = note.encrypted_tags 
              ? JSON.parse(await decryptData(note.encrypted_tags, userId) || '[]')
              : [];

            return {
              id: note.id,
              title: decryptedTitle,
              content: decryptedContent,
              category: note.category,
              tags: decryptedTags,
              is_favorite: note.is_favorite,
              mood: note.mood,
              weather: note.weather,
              created_at: note.created_at,
              updated_at: note.updated_at,
              user_id: note.user_id
            };
          } catch (decryptError) {
            console.error('Error decrypting note:', decryptError);
            return {
              id: note.id,
              title: '[Decryption Failed]',
              content: '[Unable to decrypt note content]',
              category: note.category,
              tags: [],
              is_favorite: note.is_favorite,
              mood: note.mood,
              weather: note.weather,
              created_at: note.created_at,
              updated_at: note.updated_at,
              user_id: note.user_id
            };
          }
        })
      );

      setNotes(decryptedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      setError('Failed to load notes. Please ensure you are logged in.');
    }
  };

  const filterAndSortNotes = () => {
    let filtered = notes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    // Sort notes
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'updated':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'date':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredNotes(filtered);
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !user) {
      setError('Title is required and you must be logged in');
      return;
    }

    try {
      const tags = newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      // Encrypt sensitive data
      const encryptedTitle = await encryptData(newNote.title, user.id);
      const encryptedContent = await encryptData(newNote.content, user.id);
      const encryptedTags = tags.length > 0 
        ? await encryptData(JSON.stringify(tags), user.id)
        : null;

      const noteData = {
        encrypted_title: encryptedTitle,
        encrypted_content: encryptedContent,
        category: newNote.category,
        encrypted_tags: encryptedTags,
        mood: newNote.mood,
        weather: newNote.weather,
        user_id: user.id,
        is_favorite: false,
        title_hash: generateHash(newNote.title.toLowerCase()),
        content_hash: generateHash(newNote.content.toLowerCase())
      };

      const { data, error } = await supabase
        .from('notes')
        .insert([noteData])
        .select()
        .single();

      if (error) throw error;

      // Create the decrypted note object for local state
      const decryptedNote = {
        id: data.id,
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        tags: tags,
        is_favorite: false,
        mood: newNote.mood,
        weather: newNote.weather,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: data.user_id
      };

      setNotes(prev => [decryptedNote, ...prev]);
      setNewNote({ title: '', content: '', category: 'personal', tags: '', mood: '', weather: '' });
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating note:', error);
      setError('Failed to create note');
    }
  };

  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Prepare encrypted updates
      const encryptedUpdates: any = {};
      
      if (updates.title !== undefined) {
        encryptedUpdates.encrypted_title = await encryptData(updates.title, user.id);
        encryptedUpdates.title_hash = generateHash(updates.title.toLowerCase());
      }
      
      if (updates.content !== undefined) {
        encryptedUpdates.encrypted_content = await encryptData(updates.content, user.id);
        encryptedUpdates.content_hash = generateHash(updates.content.toLowerCase());
      }
      
      if (updates.tags !== undefined) {
        encryptedUpdates.encrypted_tags = updates.tags.length > 0 
          ? await encryptData(JSON.stringify(updates.tags), user.id)
          : null;
      }

      // Non-encrypted fields
      if (updates.category !== undefined) encryptedUpdates.category = updates.category;
      if (updates.mood !== undefined) encryptedUpdates.mood = updates.mood;
      if (updates.weather !== undefined) encryptedUpdates.weather = updates.weather;
      if (updates.is_favorite !== undefined) encryptedUpdates.is_favorite = updates.is_favorite;

      const { error } = await supabase
        .from('notes')
        .update(encryptedUpdates)
        .eq('id', noteId);

      if (error) throw error;

      // Update local state with decrypted data
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, ...updates, updated_at: new Date().toISOString() } : note
      ));
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
      setError('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== noteId));
      setPreviewNote(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note');
    }
  };

  const toggleFavorite = async (noteId: string, isFavorite: boolean) => {
    await handleUpdateNote(noteId, { is_favorite: !isFavorite });
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : '📝';
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : 'text-gray-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTodaysPrompts = () => {
    const prompts = [
      "What are three things you're grateful for today?",
      "Describe a moment that made you smile recently.",
      "What's one goal you want to accomplish this week?",
      "How are you feeling right now, and why?",
      "What did you learn today?",
      "What's something that challenged you recently?",
      "Describe your ideal day.",
      "What's one thing you want to remember about today?"
    ];
    const today = new Date().getDate();
    return prompts[today % prompts.length];
  };

  if (!user) {
    return (
      <div 
        className="flex size-full min-h-screen flex-col bg-[#f6f0e4] group/design-root overflow-x-hidden"
        style={{ 
          fontFamily: '"Space Grotesk", "Noto Sans", sans-serif',
          backgroundImage: 'url("/images/bg_image.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/15 pointer-events-none"></div>
        <div className="relative z-10">
          <Navbar />
          <main className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5 pt-20">
            <div className="text-center py-20">
              <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-12">
                <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Notes & Journaling</h2>
                <p className="text-[#2a2a2a] mb-6">Please log in to access your personal notes and journal.</p>
                <a 
                  href="/login" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2"
                >
                  <PenTool className="w-4 h-4" />
                  Sign In to Start Writing
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div 
        className="flex size-full min-h-screen flex-col bg-[#f6f0e4] group/design-root overflow-x-hidden"
        style={{ 
          fontFamily: '"Space Grotesk", "Noto Sans", sans-serif',
          backgroundImage: 'url("/images/bg_image.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/15 pointer-events-none"></div>
        <div className="relative z-10">
          <Navbar />
          <main className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5 pt-20">
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#1a1a1a] font-medium">Loading your notes...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex size-full min-h-screen flex-col bg-[#f6f0e4] group/design-root overflow-x-hidden"
      style={{ 
        fontFamily: '"Space Grotesk", "Noto Sans", sans-serif',
        backgroundImage: 'url("/images/bg_image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/15 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5 pt-20">
          <div className="layout-content-container flex flex-col w-full max-w-[1400px] flex-1">
            
            {/* Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4 mb-6">
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-6 border border-white/40 shadow-lg flex-1 min-w-[300px]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100/80 rounded-xl backdrop-blur-sm">
                    <BookOpen className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-[#1a1a1a] tracking-light text-[32px] font-bold leading-tight drop-shadow-lg">Notes & Journal</h1>
                    <p className="text-[#2a2a2a] text-sm drop-shadow-sm">Capture your thoughts, ideas, and memories</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50/80 border border-red-200/50 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
                <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Today's Writing Prompt */}
            <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-[#1a1a1a]">Today's Writing Prompt</h3>
              </div>
              <p className="text-[#2a2a2a] italic mb-4">"{getTodaysPrompts()}"</p>
              <button
                onClick={() => {
                  setNewNote(prev => ({ ...prev, title: "Today's Reflection", content: getTodaysPrompts() + "\n\n" }));
                  setIsCreating(true);
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 text-sm"
              >
                Start Writing
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Create New Note Button */}
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <Plus className="w-5 h-5" />
                  New Note
                </button>

                {/* Search */}
                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#1a1a1a] placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-4">
                  <h3 className="font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                          selectedCategory === category.name
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/30 hover:bg-white/50 text-[#1a1a1a]'
                        }`}
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span className="capitalize">{category.name}</span>
                        <span className="ml-auto text-xs">
                          {category.name === 'all' 
                            ? notes.length 
                            : notes.filter(note => note.category === category.name).length
                          }
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-4">
                  <h3 className="font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Sort By
                  </h3>
                  <div className="space-y-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white/50 border border-white/40 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#1a1a1a]"
                    >
                      <option value="date">Date Created</option>
                      <option value="updated">Last Updated</option>
                      <option value="title">Title</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/30 hover:bg-white/50 rounded-lg transition-all text-[#1a1a1a]"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                      {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Create/Edit Note Modal */}
                {(isCreating || editingNote) && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                      <div className="p-6 border-b border-white/30">
                        <h2 className="text-xl font-semibold text-[#1a1a1a] flex items-center gap-2">
                          <PenTool className="w-5 h-5" />
                          {editingNote ? 'Edit Note' : 'Create New Note'}
                        </h2>
                      </div>
                      
                      <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Title</label>
                            <input
                              type="text"
                              value={editingNote ? editingNote.title : newNote.title}
                              onChange={(e) => editingNote 
                                ? setEditingNote({ ...editingNote, title: e.target.value })
                                : setNewNote(prev => ({ ...prev, title: e.target.value }))
                              }
                              className="w-full px-4 py-3 bg-white/70 border border-white/40 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#1a1a1a]"
                              placeholder="Enter note title..."
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Category</label>
                              <select
                                value={editingNote ? editingNote.category : newNote.category}
                                onChange={(e) => editingNote 
                                  ? setEditingNote({ ...editingNote, category: e.target.value })
                                  : setNewNote(prev => ({ ...prev, category: e.target.value }))
                                }
                                className="w-full px-3 py-2 bg-white/70 border border-white/40 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#1a1a1a]"
                              >
                                {categories.filter(cat => cat.name !== 'all').map(category => (
                                  <option key={category.name} value={category.name}>
                                    {category.icon} {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Mood</label>
                              <select
                                value={editingNote ? editingNote.mood || '' : newNote.mood}
                                onChange={(e) => editingNote 
                                  ? setEditingNote({ ...editingNote, mood: e.target.value })
                                  : setNewNote(prev => ({ ...prev, mood: e.target.value }))
                                }
                                className="w-full px-3 py-2 bg-white/70 border border-white/40 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#1a1a1a]"
                              >
                                <option value="">Select mood...</option>
                                {moods.map(mood => (
                                  <option key={mood.label} value={mood.label}>
                                    {mood.emoji} {mood.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Weather</label>
                              <select
                                value={editingNote ? editingNote.weather || '' : newNote.weather}
                                onChange={(e) => editingNote 
                                  ? setEditingNote({ ...editingNote, weather: e.target.value })
                                  : setNewNote(prev => ({ ...prev, weather: e.target.value }))
                                }
                                className="w-full px-3 py-2 bg-white/70 border border-white/40 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#1a1a1a]"
                              >
                                <option value="">Select weather...</option>
                                {weatherOptions.map(weather => (
                                  <option key={weather.label} value={weather.label}>
                                    {weather.emoji} {weather.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Tags (comma-separated)</label>
                            <input
                              type="text"
                              value={editingNote ? editingNote.tags.join(', ') : newNote.tags}
                              onChange={(e) => editingNote 
                                ? setEditingNote({ ...editingNote, tags: e.target.value.split(',').map(tag => tag.trim()) })
                                : setNewNote(prev => ({ ...prev, tags: e.target.value }))
                              }
                              className="w-full px-4 py-3 bg-white/70 border border-white/40 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#1a1a1a]"
                              placeholder="work, personal, idea..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Content</label>
                            <textarea
                              value={editingNote ? editingNote.content : newNote.content}
                              onChange={(e) => editingNote 
                                ? setEditingNote({ ...editingNote, content: e.target.value })
                                : setNewNote(prev => ({ ...prev, content: e.target.value }))
                              }
                              className="w-full px-4 py-3 bg-white/70 border border-white/40 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#1a1a1a] resize-none"
                              rows={12}
                              placeholder="Write your thoughts..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-6 border-t border-white/30 flex gap-3 justify-end">
                        <button
                          onClick={() => {
                            setIsCreating(false);
                            setEditingNote(null);
                            setNewNote({ title: '', content: '', category: 'personal', tags: '', mood: '', weather: '' });
                          }}
                          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={editingNote ? () => handleUpdateNote(editingNote.id, editingNote) : handleCreateNote}
                          className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {editingNote ? 'Update' : 'Create'} Note
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Grid */}
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2">No notes found</h3>
                      <p className="text-[#2a2a2a] mb-6">
                        {searchTerm || selectedCategory !== 'all' 
                          ? 'Try adjusting your search or filter criteria.' 
                          : 'Start writing your first note to capture your thoughts and ideas.'
                        }
                      </p>
                      {!searchTerm && selectedCategory === 'all' && (
                        <button
                          onClick={() => setIsCreating(true)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Write Your First Note
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredNotes.map((note) => (
                      <div key={note.id} className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-6 hover:bg-white/50 transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getCategoryIcon(note.category)}</span>
                            <h3 className="font-semibold text-[#1a1a1a] truncate">{note.title}</h3>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => toggleFavorite(note.id, note.is_favorite)}
                              className="p-1 hover:bg-white/50 rounded transition-colors"
                            >
                              {note.is_favorite ? 
                                <Star className="w-4 h-4 text-yellow-500 fill-current" /> : 
                                <StarOff className="w-4 h-4 text-gray-400" />
                              }
                            </button>
                            <button
                              onClick={() => setPreviewNote(note)}
                              className="p-1 hover:bg-white/50 rounded transition-colors"
                            >
                              <Eye className="w-4 h-4 text-blue-500" />
                            </button>
                            <button
                              onClick={() => setEditingNote(note)}
                              className="p-1 hover:bg-white/50 rounded transition-colors"
                            >
                              <Edit3 className="w-4 h-4 text-green-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1 hover:bg-white/50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[#2a2a2a] text-sm mb-4 line-clamp-3">
                          {note.content.slice(0, 150)}...
                        </p>

                        <div className="flex items-center justify-between text-xs text-[#2a2a2a]">
                          <div className="flex items-center gap-4">
                            {note.mood && (
                              <span className="flex items-center gap-1">
                                {moods.find(m => m.label === note.mood)?.emoji}
                                {note.mood}
                              </span>
                            )}
                            {note.weather && (
                              <span className="flex items-center gap-1">
                                {weatherOptions.find(w => w.label === note.weather)?.emoji}
                                {note.weather}
                              </span>
                            )}
                          </div>
                          <span>{formatDate(note.created_at)}</span>
                        </div>

                        {note.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {note.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100/80 text-blue-700 text-xs rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Preview Modal */}
                {previewNote && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                      <div className="p-6 border-b border-white/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCategoryIcon(previewNote.category)}</span>
                          <h2 className="text-xl font-semibold text-[#1a1a1a]">{previewNote.title}</h2>
                          {previewNote.is_favorite && (
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <button
                          onClick={() => setPreviewNote(null)}
                          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                        >
                          <EyeOff className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                      
                      <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 text-sm text-[#2a2a2a]">
                            <span>📅 {formatDate(previewNote.created_at)}</span>
                            {previewNote.mood && (
                              <span>
                                {moods.find(m => m.label === previewNote.mood)?.emoji} {previewNote.mood}
                              </span>
                            )}
                            {previewNote.weather && (
                              <span>
                                {weatherOptions.find(w => w.label === previewNote.weather)?.emoji} {previewNote.weather}
                              </span>
                            )}
                          </div>

                          <div className="prose prose-gray max-w-none">
                            <p className="text-[#1a1a1a] whitespace-pre-wrap leading-relaxed">
                              {previewNote.content}
                            </p>
                          </div>

                          {previewNote.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/30">
                              {previewNote.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100/80 text-blue-700 text-sm rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotesPage; 