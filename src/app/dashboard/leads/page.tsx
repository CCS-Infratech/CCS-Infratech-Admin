'use client';

import { useEffect, useState } from 'react';
import { leadService, Lead } from '@/http/leads';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Loader2,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS: Lead['status'][] = [
  'NEW',
  'CONTACTED',
  'FOLLOW_UP',
  'CONVERTED',
  'CLOSED'
];

const TYPE_OPTIONS: Lead['type'][] = [
  'CONTACT',
  'LEAD',
  'SITE_VISIT'
];

function formatStatus(status: Lead['status']) {
  return status.replace('_', ' ');
}

function formatType(type: Lead['type']) {
  return type.replace('_', ' ');
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const params: Record<string, string | number> = {
        page,
        limit: 20
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (type !== 'ALL') {
        params.type = type;
      }

      if (status !== 'ALL') {
        params.status = status;
      }

      const response = await leadService.getLeads(params);

      setLeads(response.data || []);
      setTotal(response.pagination?.total || 0);
      setPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load leads:', error);
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, type, status]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    if (page !== 1) {
      setPage(1);
      return;
    }

    await fetchLeads();
  };

  const handleStatusChange = async (
    id: string,
    newStatus: Lead['status']
  ) => {
    try {
      setUpdatingId(id);

      await leadService.updateStatus(id, newStatus);

      setLeads((current) =>
        current.map((lead) =>
          lead.id === id
            ? { ...lead, status: newStatus }
            : lead
        )
      );

      toast.success('Lead status updated');
    } catch (error) {
      console.error('Failed to update lead status:', error);
      toast.error('Failed to update lead status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (lead: Lead) => {
    const confirmed = window.confirm(
      `Delete the enquiry from ${lead.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(lead.id);

      await leadService.deleteLead(lead.id);

      setLeads((current) =>
        current.filter((item) => item.id !== lead.id)
      );

      setTotal((current) => Math.max(current - 1, 0));

      toast.success('Enquiry deleted');
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast.error('Failed to delete enquiry');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Leads & Enquiries
          </h1>

          <p className='text-muted-foreground'>
            View and manage enquiries submitted through the CCS website.
          </p>
        </div>

        <Button
          variant='outline'
          onClick={fetchLeads}
          disabled={loading}
        >
          <RefreshCw className='mr-2 h-4 w-4' />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Website Enquiries ({total})
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='flex flex-col gap-3 lg:flex-row'>
            <form
              onSubmit={handleSearch}
              className='flex flex-1 gap-2'
            >
              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder='Search name, phone, email or project...'
              />

              <Button type='submit'>
                Search
              </Button>
            </form>

            <Select
              value={type}
              onValueChange={(value) => {
                setType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className='w-full lg:w-[180px]'>
                <SelectValue placeholder='Type' />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value='ALL'>
                  All Types
                </SelectItem>

                {TYPE_OPTIONS.map((item) => (
                  <SelectItem
                    key={item}
                    value={item}
                  >
                    {formatType(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className='w-full lg:w-[180px]'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value='ALL'>
                  All Statuses
                </SelectItem>

                {STATUS_OPTIONS.map((item) => (
                  <SelectItem
                    key={item}
                    value={item}
                  >
                    {formatStatus(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='overflow-x-auto rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className='text-right'>
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className='h-32 text-center'
                    >
                      <Loader2 className='mx-auto h-6 w-6 animate-spin' />
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className='h-32 text-center text-muted-foreground'
                    >
                      No enquiries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className='font-medium'>
                          {lead.name}
                        </div>

                        {lead.email && (
                          <div className='text-muted-foreground text-xs'>
                            {lead.email}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className='whitespace-nowrap'>
                        {lead.phone}
                      </TableCell>

                      <TableCell>
                        {lead.project || '—'}
                      </TableCell>

                      <TableCell>
                        <Badge variant='outline'>
                          {formatType(lead.type)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {lead.budget || '—'}
                      </TableCell>

                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(value) =>
                            handleStatusChange(
                              lead.id,
                              value as Lead['status']
                            )
                          }
                          disabled={
                            updatingId === lead.id
                          }
                        >
                          <SelectTrigger className='w-[150px]'>
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            {STATUS_OPTIONS.map(
                              (item) => (
                                <SelectItem
                                  key={item}
                                  value={item}
                                >
                                  {formatStatus(item)}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className='whitespace-nowrap text-sm'>
                        {formatDate(lead.createdAt)}
                      </TableCell>

                      <TableCell className='text-right'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() =>
                            handleDelete(lead)
                          }
                          disabled={
                            deletingId === lead.id
                          }
                        >
                          {deletingId === lead.id ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <Trash2 className='h-4 w-4 text-red-500' />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground text-sm'>
              Page {page} of {pages}
            </p>

            <div className='flex gap-2'>
              <Button
                variant='outline'
                disabled={page <= 1 || loading}
                onClick={() =>
                  setPage((current) => current - 1)
                }
              >
                Previous
              </Button>

              <Button
                variant='outline'
                disabled={page >= pages || loading}
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
