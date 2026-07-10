import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts } from '../../redux/actions/post.actions.js';
import { fetchUserData } from '../../redux/actions/user.actions.js';
import { fetchUserProfile } from '../../utils/storage.js';
import { useTheme } from '../../context/themeContext.js';
import PostCard from '../PostCard/PostCard.js'
import PostsSkeleton from '../Skeletons/PostsSkeleton' 
import './posts.styles.css';

const Posts = ({ setCurrentId }) => {
    const dispatch = useDispatch();
    const darkMode = useTheme();

    const profile = fetchUserProfile();
    const userId = profile?._id;

    const { posts, isLoading, numberOfPages } = useSelector((state) => state.postsReducer);
    const { clientData } = useSelector((state) => state.userReducer);

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(fetchPosts(currentPage));
    }, [currentPage, dispatch, userId]);

    useEffect(() => {
        if (userId && !clientData) {
            dispatch(fetchUserData(userId));
        }
    }, [clientData, dispatch, userId]);

    const fetchMorePosts = useCallback(() => {
        if (currentPage < numberOfPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    }, [currentPage, numberOfPages]);

    return (
        <div>
            {isLoading && currentPage === 1 ? (
                <PostsSkeleton darkMode={darkMode} initialCount={6} />
            ) : (
                <InfiniteScroll
                    dataLength={posts.length}
                    next={fetchMorePosts}
                    hasMore={currentPage < numberOfPages}
                    scrollThreshold={0.5}
                    loader={
                        <div style={{ padding: '16px 0' }}>
                            <PostsSkeleton darkMode={darkMode} initialCount={3} />
                        </div>
                    }
                    endMessage={
                        <Typography
                            className={`endmsg ${darkMode ? 'dark' : ''}`}
                            variant='h5'
                            align='center'
                        >
                            You've reached the end of the wheel.
                        </Typography>
                    }
                    style={{ overflowX: 'hidden' }}
                >
                    <Grid
                        className="container"
                        container
                        alignItems="stretch"
                        spacing={4}
                    >
                        {posts.map((post) => (
                            <Grid key={post._id} item xs={12} sm={6} lg={4}>
                                <PostCard
                                    post={post}
                                    setCurrentId={setCurrentId}
                                    darkMode={darkMode}
                                    bookmarks={clientData?.bookmarks}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </InfiniteScroll>
            )}
        </div>
    );
};

export default Posts;
