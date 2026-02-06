import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/searchService';
import { PostCard } from '../components/PostCard';
import { UserSummary } from '@/types/User';
import { Post } from '@/types/Post';

const Search: React.FC = () => {
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'hashtags'>('users');
    const [userResults, setUserResults] = useState<UserSummary[]>([]);
    const [postResults, setPostResults] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // const { user } = useAuthStore(); // This line is commented out or removed as useAuthStore is no longer imported

    // Debounce logic could be added here, currently searching on explicit enter or effect with delay
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length < 2) {
                setUserResults([]);
                setPostResults([]);
                return;
            }

            setLoading(true);
            try {
                if (activeTab === 'users') {
                    const results = await searchService.searchUsers(query);
                    setUserResults(results);
                } else if (activeTab === 'posts') {
                    // Pass dummy location for now, or get real location
                    const results = await searchService.searchPosts(query);
                    setPostResults(results);
                } else if (activeTab === 'hashtags') {
                    const results = await searchService.searchHashtags(query);
                    setPostResults(results);
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query, activeTab]);

    return (
        <div className="pb-20 pt-4 px-4 max-w-2xl mx-auto">
            {/* Search Input */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`flex-1 py-2 px-4 text-center ${activeTab === 'users'
                        ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('users')}
                >
                    People
                </button>
                <button
                    className={`flex-1 py-2 px-4 text-center ${activeTab === 'posts'
                        ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('posts')}
                >
                    Posts
                </button>
                <button
                    className={`flex-1 py-2 px-4 text-center ${activeTab === 'hashtags'
                        ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('hashtags')}
                >
                    Hashtags
                </button>
            </div>

            {/* Results */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {activeTab === 'users' && (
                        <div className="space-y-3">
                            {userResults.length === 0 && query.length >= 2 && (
                                <p className="text-center text-gray-500">No users found.</p>
                            )}
                            {userResults.map((u) => (
                                <div
                                    key={u.userId}
                                    className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow cursor-pointer"
                                    onClick={() => navigate(`/user/${u.userId}`)}
                                >
                                    <img
                                        src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.alias}&background=random`}
                                        alt={u.alias}
                                        className="w-12 h-12 rounded-full mr-4 object-cover"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{u.name || u.alias}</h3>
                                        <p className="text-sm text-gray-500">@{u.alias}</p>
                                        {u.isFriend && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                                Friend
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {(activeTab === 'posts' || activeTab === 'hashtags') && (
                        <div className="space-y-6">
                            {postResults.length === 0 && query.length >= 2 && (
                                <p className="text-center text-gray-500">No posts found.</p>
                            )}
                            {postResults.map((post) => (
                                <PostCard key={post.id} post={post as any} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
