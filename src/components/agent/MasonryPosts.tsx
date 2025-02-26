import React, { useEffect } from 'react';
import { CiHeart, CiBookmark } from 'react-icons/ci';
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
  scroll?: boolean;
  scrollSize?: number;
}

// Main component with TypeScript typing
const MasonryPostsLayout: React.FC<MasonryPostsLayoutProps> = ({ 
  posts, 
  username, 
  handler,
  className = "",
  columns = 4,
  scroll,
  scrollSize,
}) => {
  useEffect(() => {
    if (scroll && !scrollSize) {
      console.error('You need to set "scrollSize prop" when you are using "scroll" prop');
    }
  }, [scroll])
  
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
              <div className="rounded-full bg-gray-100 border p-1">
                <svg stroke="none" fill="black" strokeWidth="1.5"
                  viewBox="0 0 24 24" aria-hidden="true" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z">
                  </path>
                </svg>
              </div>
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
      {scroll ? (
        <div className="overflow-y-hidden" style={{height: scrollSize}}>
          <div className="overflow-y-scroll" style={{height: scrollSize}}>
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
                        <div className="rounded-full bg-gray-100 border p-1">
                          <svg stroke="none" fill="black" strokeWidth="1.5"
                            viewBox="0 0 24 24" aria-hidden="true" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z">
                            </path>
                          </svg>
                        </div>
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
        </div>
      ) : (
        <>
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
                      <div className="rounded-full bg-gray-100 border p-1">
                        <svg stroke="none" fill="black" strokeWidth="1.5"
                          viewBox="0 0 24 24" aria-hidden="true" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z">
                          </path>
                        </svg>
                      </div>
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
        </>
      )}
    </div>
  );
};

export default MasonryPostsLayout;