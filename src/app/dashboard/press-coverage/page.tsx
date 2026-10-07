'use client';

import React, {
  useState,
  useEffect,
  useRef
} from 'react';

import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

import { pressService } from '@/http/press';
import { cn } from '@/lib/utils';

import {
  IconPlus,
  IconEdit,
  IconNews,
  IconDotsVertical,
  IconX,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react';

import Link from 'next/link';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface PressItem {
  id: string;
  title: string;
  publicationName?: string;
  publicationDate?: string;
  url: string;
  imageUrl?: string;
  excerpt?: string;
  sortOrder: number;
  pressId: string;
  createdAt: string;
  updatedAt: string;
}

interface Press {
  id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: PressItem[];
}

interface PressPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/* -------------------------------------------------------------------------- */
/* Press Card                                                                 */
/* -------------------------------------------------------------------------- */

const PressCard = ({
  press,
}: {
  press: Press;
}) => {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const buttonRef =
    useRef<HTMLButtonElement>(null);

  /* Close menu when clicking outside */
  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(
          event.target as Node
        ) &&
        !buttonRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  const featuredItem =
    press.items?.length > 0
      ? press.items[0]
      : null;

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg bg-white',
        'transition-all duration-300 ease-out hover:translate-y-[-4px]',
        'ring-1 ring-gray-100 hover:shadow-lg'
      )}
    >
      {/* Image */}
      <div className='relative aspect-[5/3] overflow-hidden bg-gray-50'>
        {featuredItem ? (
          <div className='h-full overflow-hidden'>
            {featuredItem.imageUrl ? (
              <img
                src={featuredItem.imageUrl}
                alt={featuredItem.title}
                className='h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-gray-100 p-6'>
                <IconNews
                  className='h-12 w-12 text-gray-300'
                  stroke={1}
                />
              </div>
            )}

            {/* Publication overlay */}
            {featuredItem.publicationName && (
              <div className='absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-4'>
                <div className='text-sm font-medium text-white'>
                  {featuredItem.publicationName}
                </div>

                {featuredItem.publicationDate && (
                  <div className='text-xs text-gray-200'>
                    {new Date(
                      featuredItem.publicationDate
                    ).toLocaleDateString(
                      undefined,
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className='flex h-full items-center justify-center p-6 text-gray-300'>
            <IconNews
              className='h-12 w-12'
              stroke={1}
            />
          </div>
        )}

        {/* Status indicator */}
        <div
          className={cn(
            'absolute top-3 right-3 flex h-2.5 w-2.5 items-center justify-center rounded-full',
            press.isActive
              ? 'bg-emerald-500'
              : 'bg-gray-400'
          )}
        >
          <span className='sr-only'>
            {press.isActive
              ? 'Active'
              : 'Draft'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col p-5'>
        <div className='mb-2 flex items-start justify-between'>
          <h3 className='line-clamp-1 text-lg leading-tight font-medium tracking-tight text-gray-900'>
            {press.name}
          </h3>

          <div className='relative z-10'>
            <button
              ref={buttonRef}
              type='button'
              className='rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(
                  (previous) => !previous
                );
              }}
            >
              <IconDotsVertical className='h-4 w-4' />

              <span className='sr-only'>
                Menu
              </span>
            </button>

            {menuOpen && (
              <div
                ref={menuRef}
                className='ring-opacity-5 absolute top-0 right-0 z-50 mt-8 w-48 overflow-hidden rounded-md bg-white py-1 shadow-xl focus:outline-none'
                style={{
                  transform:
                    'translateY(-50%)',
                }}
              >
                <div className='flex items-center justify-between border-b border-gray-100 px-4 py-2'>
                  <span className='text-xs font-medium text-gray-500'>
                    Actions
                  </span>

                  <button
                    type='button'
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className='rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  >
                    <IconX size={14} />
                  </button>
                </div>

                <Link
                  href={`/dashboard/press-coverage/edit/${press.id}`}
                  className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  <IconEdit className='mr-2 h-4 w-4' />

                  Edit Press Category
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className='mb-4 line-clamp-2 text-sm font-light text-gray-500'>
          {press.description ||
            'No description provided'}
        </p>

        {/* Footer */}
        <div className='mt-auto flex items-center justify-between text-xs text-gray-400'>
          <div className='flex items-center'>
            <span className='font-medium'>
              {press.items?.length || 0}{' '}
              article
              {press.items?.length !== 1
                ? 's'
                : ''}
            </span>
          </div>

          <span>
            {new Date(
              press.createdAt
            ).toLocaleDateString(
              undefined,
              {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers: number[] = [];

  /*
   * Keep pagination compact.
   *
   * For example:
   * 1 2 3 4 5 ... 15
   */
  if (totalPages <= 7) {
    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      pageNumbers.push(page);
    }
  } else {
    pageNumbers.push(1);

    if (currentPage > 4) {
      pageNumbers.push(-1);
    }

    const start = Math.max(
      2,
      currentPage - 1
    );

    const end = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (
      let page = start;
      page <= end;
      page++
    ) {
      pageNumbers.push(page);
    }

    if (currentPage < totalPages - 3) {
      pageNumbers.push(-1);
    }

    pageNumbers.push(totalPages);
  }

  return (
    <div className='flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row'>
      <div className='text-sm text-gray-500'>
        Page {currentPage} of {totalPages}
      </div>

      <div className='flex items-center gap-1'>
        {/* Previous */}
        <button
          type='button'
          disabled={currentPage === 1}
          onClick={() =>
            onPageChange(currentPage - 1)
          }
          className={cn(
            'inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm',
            'border-gray-200 bg-white text-gray-700',
            'hover:bg-gray-50',
            'disabled:pointer-events-none disabled:opacity-40'
          )}
        >
          <IconChevronLeft className='mr-1 h-4 w-4' />
          Previous
        </button>

        {/* Page numbers */}
        <div className='hidden items-center gap-1 sm:flex'>
          {pageNumbers.map(
            (page, index) => {
              if (page === -1) {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className='px-2 text-sm text-gray-400'
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  type='button'
                  onClick={() =>
                    onPageChange(page)
                  }
                  className={cn(
                    'h-9 min-w-9 rounded-md border px-2 text-sm',
                    currentPage === page
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {page}
                </button>
              );
            }
          )}
        </div>

        {/* Next */}
        <button
          type='button'
          disabled={
            currentPage === totalPages
          }
          onClick={() =>
            onPageChange(currentPage + 1)
          }
          className={cn(
            'inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm',
            'border-gray-200 bg-white text-gray-700',
            'hover:bg-gray-50',
            'disabled:pointer-events-none disabled:opacity-40'
          )}
        >
          Next
          <IconChevronRight className='ml-1 h-4 w-4' />
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Press Listing                                                              */
/* -------------------------------------------------------------------------- */

const PressListingPage = () => {
  const CARDS_PER_PAGE = 15;

  const [pressCategories, setPressCategories] =
    useState<Press[]>([]);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pagination, setPagination] =
    useState<PressPagination>({
      page: 1,
      limit: CARDS_PER_PAGE,
      total: 0,
      pages: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const fetchPress = async (
    page: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response: any =
        await pressService.getAllPress({
          page,
          limit: CARDS_PER_PAGE,
        });

      const pressData =
        response?.data ?? [];

      const paginationData =
        response?.pagination ?? {
          page,
          limit: CARDS_PER_PAGE,
          total: pressData.length,
          pages: Math.ceil(
            pressData.length /
              CARDS_PER_PAGE
          ),
        };

      setPressCategories(
        Array.isArray(pressData)
          ? pressData
          : []
      );

      setPagination({
        page:
          Number(
            paginationData.page
          ) || page,

        limit:
          Number(
            paginationData.limit
          ) || CARDS_PER_PAGE,

        total:
          Number(
            paginationData.total
          ) || 0,

        pages:
          Number(
            paginationData.pages
          ) || 0,
      });
    } catch (err) {
      console.error(
        'Error fetching press categories:',
        err
      );

      setError(
        'Failed to load press categories'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Fetch whenever page changes.
   */
  useEffect(() => {
    fetchPress(currentPage);
  }, [currentPage]);

  const handlePageChange = (
    page: number
  ) => {
    if (
      page < 1 ||
      page > pagination.pages ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);

    /*
     * Start from the top of the Press content
     * when changing pages.
     */
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (loading && pressCategories.length === 0) {
    return (
      <DataTableSkeleton
        columnCount={5}
        rowCount={8}
        filterCount={2}
      />
    );
  }

  if (error && pressCategories.length === 0) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='rounded-lg bg-white p-8 shadow-sm'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50'>
            <IconNews className='h-6 w-6 text-red-500' />
          </div>

          <h3 className='text-center text-lg font-medium'>
            {error}
          </h3>

          <p className='mt-2 text-center text-sm text-gray-500'>
            We couldn't load your press
            categories right now.
          </p>

          <button
            type='button'
            onClick={() =>
              fetchPress(currentPage)
            }
            className={cn(
              buttonVariants({
                variant: 'outline',
              }),
              'mx-auto mt-4 block'
            )}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (
    !loading &&
    pressCategories.length === 0
  ) {
    return (
      <div className='flex h-80 flex-col items-center justify-center rounded-xl bg-gray-50/50 px-8 py-12'>
        <div className='rounded-full bg-gray-100/80 p-5'>
          <IconNews
            className='h-8 w-8 text-gray-400'
            stroke={1.5}
          />
        </div>

        <h3 className='mt-6 text-base font-medium text-gray-700'>
          Your press collection is empty
        </h3>

        <p className='mt-2 max-w-md text-center text-sm text-gray-500'>
          Create your first press category
          to organize and showcase media
          coverage and publications.
        </p>

        <Link
          href='/dashboard/press-coverage/new'
          className={cn(
            buttonVariants({
              variant: 'default',
            }),
            'mt-6 bg-black text-white hover:bg-gray-800'
          )}
        >
          <IconPlus
            className='mr-1.5 h-4 w-4'
            stroke={2}
          />

          New Press Category
        </Link>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Loading indicator while changing page */}
      {loading && (
        <div className='flex items-center justify-end text-xs text-gray-400'>
          Loading...
        </div>
      )}

      {/* Error while keeping existing page visible */}
      {error && (
        <div className='rounded-md bg-red-50 px-4 py-3 text-sm text-red-600'>
          {error}
        </div>
      )}

      {/* Cards */}
      <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {pressCategories.map(
          (press) => (
            <PressCard
              key={press.id}
              press={press}
            />
          )
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={pagination.pages}
        onPageChange={
          handlePageChange
        }
      />

      {/* Total */}
      {pagination.total > 0 && (
        <div className='text-center text-xs text-gray-400'>
          Showing{' '}
          {Math.min(
            (currentPage - 1) *
              CARDS_PER_PAGE +
              1,
            pagination.total
          )}
          {' - '}
          {Math.min(
            currentPage *
              CARDS_PER_PAGE,
            pagination.total
          )}{' '}
          of {pagination.total}{' '}
          press categories
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function PressPage() {
  return (
    /*
     * Keep scrolling enabled for this Press page.
     * No global dashboard layout changes are needed.
     */
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex flex-col items-start justify-between space-y-4 pb-2 sm:flex-row sm:space-y-0 sm:pb-0'>
          <Heading
            title='Press & Coverage'
            description='Manage media mentions, articles, and press coverage.'
          />

          <Link
            href='/dashboard/press-coverage/new'
            className={cn(
              buttonVariants(),
              'bg-black text-white hover:bg-gray-800'
            )}
          >
            <IconPlus
              className='mr-2 h-4 w-4'
              stroke={2}
            />

            New Press Category
          </Link>
        </div>

        <Separator className='bg-gray-100' />

        <PressListingPage />
      </div>
    </PageContainer>
  );
}
