import React from 'react';
import { CiImageOn, CiHeart, CiBookmark } from 'react-icons/ci';
import { IoChatbubbleOutline } from 'react-icons/io5';
import { BiRepost } from 'react-icons/bi';

// Type for the separator component props
type SeparatorProps = {
  className?: string;
};

// Simple separator component
const Separator: React.FC<SeparatorProps> = ({ className = "" }) => (
  <div className={`h-px w-full bg-slate-200 my-3 ${className}`}></div>
);

// Function to get random integers with type safety
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Interface for the main component props
interface MasonryPostsLayoutProps {
  posts: string[];
  username: string;
  handler?: string;
  className?: string;
  columns?: number;
}

// Main component with TypeScript typing
const MasonryPostsLayout: React.FC<MasonryPostsLayoutProps> = ({ 
  posts, 
  username, 
  handler,
  className = "",
  columns = 4
}) => {
  // If no handler is provided, use the username
  const userHandler: string = handler || username;
  
  // Distribute posts into columns to create the masonry effect
  const distributeIntoColumns = (): string[][] => {
    const columnArrays: string[][] = Array.from({ length: columns }, () => []);
    
    posts.forEach((post, index) => {
      // Distribute into columns in an alternating pattern
      const columnIndex = index % columns;
      columnArrays[columnIndex].push(post);
    });
    
    return columnArrays;
  };
  
  const columnData = distributeIntoColumns();
  
  // Render all posts in a responsive layout
  const renderAllPosts = () => {
    // Convert the column arrays into a flat array of all posts
    const allPosts: Array<{post: string, columnIndex: number, postIndex: number}> = [];
    
    columnData.forEach((column, columnIndex) => {
      column.forEach((post, postIndex) => {
        allPosts.push({
          post,
          columnIndex,
          postIndex
        });
      });
    });
    
    return (
      <>
        {allPosts.map((item) => (
          <div 
            key={`post-${item.columnIndex}-${item.postIndex}`} 
            className="flex flex-col border p-2 rounded-lg bg-white shadow-md w-full mb-4"
          >
                            {/* Post header */}
            <div className="flex flex-row items-center gap-2">
              <CiImageOn size={40} className="border rounded-full p-2"/>
              <div className="flex flex-col">
                <span className="font-bold text-xs capitalize">{username}</span>
                <span className="font-thin text-xs">@{userHandler}</span>
              </div>
            </div>
            
                            {/* Post body */}
            <p className="my-2 text-sm">{item.post}</p>
            
                            {/* Post footer */}
            <div className="flex flex-col font-thin mt-auto">
              <span className="text-xs">
                {new Date().getHours()}:{new Date().getMinutes()} · {new Date().toDateString()} · 
                <b className="font-bold">{getRandomInt(10000, 100000)}</b> Views
              </span>
              <Separator />
              <div className="flex flex-row justify-between">
                <div className="flex flex-row items-center gap-1">
                  <IoChatbubbleOutline size={12} />
                  <span className="text-xs">{getRandomInt(10, 1000)}</span>
                </div>
                <div className="flex flex-row items-center gap-1">
                  <BiRepost size={18} />
                  <span className="text-xs">{getRandomInt(10, 1000)}</span>
                </div>
                <div className="flex flex-row items-center gap-1">
                  <CiHeart size={16} />
                  <span className="text-xs">{getRandomInt(10, 1000)}</span>
                </div>
                <div className="flex flex-row items-center gap-1">
                  <CiBookmark size={14} />
                  <span className="text-xs">{getRandomInt(10, 1000)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };
  
  return (
    <div className={`bg-gray-50 p-4 flex flex-col shadow-sm border border-slate-200 rounded-lg w-full ${className}`}>
      {/* Mobile layout: one post per row */}
      <div className="flex flex-col w-full md:hidden">
        {renderAllPosts()}
      </div>
      
      {/* Masonry layout for tablets and desktop */}
      <div className="hidden md:flex w-full gap-4">
        {columnData.map((column, columnIndex) => (
          <div key={`column-${columnIndex}`} className="flex flex-col gap-4 flex-1">
            {column.map((post, postIndex) => (
              <div 
                key={`post-${columnIndex}-${postIndex}`} 
                className="flex flex-col border p-2 rounded-lg bg-white shadow-md"
              >
                {/* Post header */}
                <div className="flex flex-row items-center gap-2">
                  <CiImageOn size={40} className="border rounded-full p-2"/>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs capitalize">{username}</span>
                    <span className="font-thin text-xs">@{userHandler}</span>
                  </div>
                </div>
                
                {/* Post body */}
                <p className="my-2 text-sm">{post}</p>
                
                {/* Post footer */}
                <div className="flex flex-col font-thin mt-auto">
                  <span className="text-xs">
                    {new Date().getHours()}:{new Date().getMinutes()} · {new Date().toDateString()} · 
                    <b className="font-bold">{getRandomInt(10000, 100000)}</b> Views
                  </span>
                  <Separator />
                  <div className="flex flex-row justify-between">
                    <div className="flex flex-row items-center gap-1">
                      <IoChatbubbleOutline size={12} />
                      <span className="text-xs">{getRandomInt(10, 1000)}</span>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                      <BiRepost size={18} />
                      <span className="text-xs">{getRandomInt(10, 1000)}</span>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                      <CiHeart size={16} />
                      <span className="text-xs">{getRandomInt(10, 1000)}</span>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                      <CiBookmark size={14} />
                      <span className="text-xs">{getRandomInt(10, 1000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasonryPostsLayout;