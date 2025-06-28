import React, { useState, useEffect } from 'react';
import { User, Key, Eye, EyeOff, Copy, Check, Plus, Trash2, Edit3, Save, X, Shield, Clock, AlertCircle, Settings, Database } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../utils/supabaseClient';

interface ApiKey {
  id: string;
  name: string;
  service: string;
  key: string;
  created_at: string;
  last_used?: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New API key form state
  const [newKey, setNewKey] = useState({
    name: '',
    service: '',
    key: ''
  });

  // Services list
  const services = [
    { value: 'openai', label: 'OpenAI', icon: '🤖' },
    { value: 'anthropic', label: 'Anthropic Claude', icon: '🧠' },
    { value: 'google', label: 'Google AI', icon: '🔍' },
    { value: 'azure', label: 'Azure OpenAI', icon: '☁️' },
    { value: 'huggingface', label: 'Hugging Face', icon: '🤗' },
    { value: 'stability', label: 'Stability AI', icon: '🎨' },
    { value: 'elevenlabs', label: 'ElevenLabs', icon: '🗣️' },
    { value: 'runwayml', label: 'Runway ML', icon: '🎬' },
    { value: 'replicate', label: 'Replicate', icon: '🔄' },
    { value: 'other', label: 'Other', icon: '⚙️' }
  ];

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      setUser({
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name,
        created_at: session.user.created_at
      });

      await loadApiKeys(session.user.id);
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
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  };

  const loadApiKeys = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Decrypt API keys
      const decryptedKeys = await Promise.all(
        (data || []).map(async (apiKey: any) => {
          try {
            const decryptedKey = await decryptData(apiKey.encrypted_key, userId);
            return {
              id: apiKey.id,
              name: apiKey.name,
              service: apiKey.service,
              key: decryptedKey,
              created_at: apiKey.created_at,
              last_used: apiKey.last_used
            };
          } catch (decryptError) {
            console.error('Error decrypting API key:', decryptError);
            return {
              id: apiKey.id,
              name: apiKey.name,
              service: apiKey.service,
              key: '[Decryption Failed]',
              created_at: apiKey.created_at,
              last_used: apiKey.last_used
            };
          }
        })
      );
      
      setApiKeys(decryptedKeys);
    } catch (error) {
      console.error('Error loading API keys:', error);
      setError('Failed to load API keys. Please ensure the database is set up correctly.');
    }
  };

  const handleAddKey = async () => {
    if (!newKey.name || !newKey.service || !newKey.key) {
      setError('All fields are required');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      // Encrypt the API key
      const encryptedKey = await encryptData(newKey.key, user.id);
      const keyHash = generateHash(newKey.key);

      const { data, error } = await supabase
        .from('api_keys')
        .insert([
          {
            user_id: user.id,
            name: newKey.name,
            service: newKey.service,
            encrypted_key: encryptedKey,
            key_hash: keyHash
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add the decrypted version to local state
      const decryptedApiKey = {
        id: data.id,
        name: newKey.name,
        service: newKey.service,
        key: newKey.key,
        created_at: data.created_at,
        last_used: data.last_used
      };

      setApiKeys(prev => [decryptedApiKey, ...prev]);
      setNewKey({ name: '', service: '', key: '' });
      setIsAddingKey(false);
      setSuccess('API key added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding API key:', error);
      setError('Failed to add API key');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      setSuccess('API key deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting API key:', error);
      setError('Failed to delete API key');
    }
  };

  const handleUpdateKey = async (keyId: string, updates: Partial<ApiKey>) => {
    try {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Prepare encrypted updates
      const encryptedUpdates: any = {};
      
      if (updates.key !== undefined) {
        encryptedUpdates.encrypted_key = await encryptData(updates.key, user.id);
        encryptedUpdates.key_hash = generateHash(updates.key);
      }
      
      // Non-encrypted fields
      if (updates.name !== undefined) encryptedUpdates.name = updates.name;
      if (updates.service !== undefined) encryptedUpdates.service = updates.service;

      const { error } = await supabase
        .from('api_keys')
        .update(encryptedUpdates)
        .eq('id', keyId);

      if (error) throw error;

      // Update local state with decrypted data
      setApiKeys(prev => prev.map(key => 
        key.id === keyId ? { ...key, ...updates } : key
      ));
      setEditingKey(null);
      setSuccess('API key updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating API key:', error);
      setError('Failed to update API key');
    }
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.slice(0, 4) + '*'.repeat(key.length - 8) + key.slice(-4);
  };

  const getServiceIcon = (service: string) => {
    const serviceConfig = services.find(s => s.value === service);
    return serviceConfig?.icon || '⚙️';
  };

  const getServiceLabel = (service: string) => {
    const serviceConfig = services.find(s => s.value === service);
    return serviceConfig?.label || service;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

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
                <p className="text-[#1a1a1a] font-medium">Loading dashboard...</p>
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
          <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
            
            {/* Dashboard Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4 mb-6">
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-6 border border-white/40 shadow-lg flex-1 min-w-[300px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100/80 rounded-xl backdrop-blur-sm">
                      <Database className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-[#1a1a1a] tracking-light text-[32px] font-bold leading-tight drop-shadow-lg">Dashboard</h1>
                      <p className="text-[#2a2a2a] text-sm drop-shadow-sm">Manage your API keys and account settings</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-700 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100/80 rounded-xl">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#1a1a1a] drop-shadow-sm">Profile Information</h2>
                  <p className="text-sm text-[#2a2a2a]">Your account details and information</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Email Address</label>
                    <div className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg text-[#1a1a1a]">
                      {user?.email}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Member Since</label>
                    <div className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg text-[#1a1a1a] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      {new Date(user?.created_at || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-6 p-4 bg-red-50/80 border border-red-200/50 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
                <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50/80 border border-green-200/50 rounded-lg flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-green-700">{success}</span>
                <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* API Keys Section */}
            <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100/80 rounded-xl">
                    <Key className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#1a1a1a] drop-shadow-sm">API Keys</h2>
                    <p className="text-sm text-[#2a2a2a]">Manage your API keys for various services</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsAddingKey(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  Add API Key
                </button>
              </div>

              {/* Add New Key Form */}
              {isAddingKey && (
                <div className="mb-6 p-6 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl">
                  <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New API Key
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Key Name</label>
                      <input
                        type="text"
                        value={newKey.name}
                        onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., My OpenAI Key"
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-[#1a1a1a] placeholder-gray-500 transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Service</label>
                      <select
                        value={newKey.service}
                        onChange={(e) => setNewKey(prev => ({ ...prev, service: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-[#1a1a1a] transition-all duration-200"
                      >
                        <option value="">Select a service</option>
                        {services.map(service => (
                          <option key={service.value} value={service.value}>
                            {service.icon} {service.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">API Key</label>
                    <input
                      type="password"
                      value={newKey.key}
                      onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                      placeholder="Paste your API key here"
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-[#1a1a1a] placeholder-gray-500 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddKey}
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Key
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingKey(false);
                        setNewKey({ name: '', service: '', key: '' });
                      }}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* API Keys List */}
              <div className="space-y-4">
                {apiKeys.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100/80 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Key className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-[#1a1a1a] mb-2">No API Keys Yet</h3>
                    <p className="text-[#2a2a2a] mb-4">Add your first API key to get started with AI services.</p>
                    <button
                      onClick={() => setIsAddingKey(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First API Key
                    </button>
                  </div>
                ) : (
                  apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="p-6 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl hover:bg-white/60 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-2xl">{getServiceIcon(apiKey.service)}</div>
                          <div className="flex-1">
                            {editingKey === apiKey.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  defaultValue={apiKey.name}
                                  onBlur={(e) => handleUpdateKey(apiKey.id, { name: e.target.value })}
                                  className="w-full px-3 py-2 bg-white/70 border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#1a1a1a]"
                                />
                              </div>
                            ) : (
                              <>
                                <h3 className="font-semibold text-[#1a1a1a]">{apiKey.name}</h3>
                                <p className="text-sm text-[#2a2a2a]">{getServiceLabel(apiKey.service)}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-sm font-mono text-[#2a2a2a] bg-white/70 px-2 py-1 rounded">
                                    {showKey === apiKey.id ? apiKey.key : maskApiKey(apiKey.key)}
                                  </span>
                                  <button
                                    onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                                    className="p-1 hover:bg-white/50 rounded transition-colors"
                                  >
                                    {showKey === apiKey.id ? 
                                      <EyeOff className="w-4 h-4 text-gray-600" /> : 
                                      <Eye className="w-4 h-4 text-gray-600" />
                                    }
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                                    className="p-1 hover:bg-white/50 rounded transition-colors"
                                  >
                                    {copiedKey === apiKey.id ? 
                                      <Check className="w-4 h-4 text-green-600" /> : 
                                      <Copy className="w-4 h-4 text-gray-600" />
                                    }
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingKey(editingKey === apiKey.id ? null : apiKey.id)}
                            className="p-2 hover:bg-blue-100/50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteKey(apiKey.id)}
                            className="p-2 hover:bg-red-100/50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/30">
                        <div className="flex items-center gap-4 text-xs text-[#2a2a2a]">
                          <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                          {apiKey.last_used && (
                            <span>Last used: {new Date(apiKey.last_used).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-yellow-50/80 border border-yellow-200/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Security Notice</h4>
                    <p className="text-sm text-yellow-700">
                      Your API keys are encrypted and stored securely. Never share your API keys with others. 
                      If you suspect a key has been compromised, delete it immediately and generate a new one from your service provider.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage; 