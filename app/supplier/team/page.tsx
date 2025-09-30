'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  CircleCheck,
  CircleX
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { addTeamMembers, deleteTeamMember, fetchTeamMembersByParentEmail, updateTeamMember } from '@/app/actions/teamMembers'
import { useSession } from 'next-auth/react'

interface ITeamMember {
  _id: string
  name: string
  email: string
  parentEmail: string
  parentRole: 'supplier' | 'logistic'
  teamRole: 'operations' | 'quality' | 'finance' | 'delivery-partner'
  registered: boolean
  createdAt: string
  updatedAt: string
}

const roles = ["operations", "quality", "finance", "delivery-partner"]

export default function TeamsPage() {
  const router = useRouter();
   const { data: session } = useSession();
     
  // This would typically come from a user session, hardcoding for now as a placeholder
  const mockUser = {
    email: "testlogistic@gmail.com",
    role: "supplier",
    skippedTeam: false,
  }

  const [teamMembers, setTeamMembers] = useState<ITeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMember, setCurrentMember] = useState<ITeamMember | null>(null)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    teamRole: 'operations',
  })

  const fetchData = useCallback(async () => {
    if (!session?.user?.email) return
    try {
      setIsLoading(true)
      const data = await fetchTeamMembersByParentEmail(session.user.email)

      if (data.error) {
        toast.error("Error", { description: data.error })
      } else {
        if (data.skipped) {
          toast.info("You have skipped team setup. Add team members to get started.")
        }
        setTeamMembers(data.teamMembers || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load team data")
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.email])


  // const handleLogout = async () => {
  //   try {
  //     const response = await fetch('/api/auth/logout', {
  //       method: 'POST',
  //     })
  //     if (!response.ok) {
  //       throw new Error('Logout failed')
  //     }
  //     toast.success('You have been successfully logged out')
  //     router.push('/login')
  //   } catch (error) {
  //     console.error('Logout error:', error)
  //     toast.error('Failed to logout. Please try again.')
  //   }
  // }

  const getInitials = (name: string) => {
    if (!name) return 'TM'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleAddMember = () => {
    setCurrentMember(null)
    setNewMember({ name: '', email: '', teamRole: 'operations' })
    setIsModalOpen(true)
  }

  const handleEditMember = (member: ITeamMember) => {
    setCurrentMember(member)
    setNewMember({
      name: member.name,
      email: member.email,
      teamRole: member.teamRole,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    let result

    if (currentMember) {
      // Edit existing member
      result = await updateTeamMember(currentMember._id, {
        name: newMember.name,
        email: newMember.email,
        teamRole: newMember.teamRole as any, // Mongoose enum validation happens on the server
      })
    } else {
      // Add new member
      const memberData = {
        ...newMember,
        parentEmail: session?.user.email,
        parentRole: session?.user.role,
        registered: false,
      } as any // Mongoose enum validation happens on the server
      result = await addTeamMembers([memberData])
    }

    if (result.error) {
      toast.error('Error', { description: result.error })
    } else {
      toast.success(result.message)
      setIsModalOpen(false)
      fetchData() // Re-fetch data to update the UI
    }
    setIsLoading(false)
  }

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return
    setIsLoading(true)
    const result = await deleteTeamMember(id)
    if (result.error) {
      toast.error('Error', { description: result.error })
    } else {
      toast.success(result.message)
      fetchData() // Re-fetch data to update the UI
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredMembers = teamMembers.filter((member) => {
    return (
      searchTerm === '' ||
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="min-h-screen bg-background">
      {/* <Sidebar onLogout={handleLogout} /> */}

      <div className="md:ml-64 p-4 md:p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
            <p className="text-muted-foreground">
              Manage your team members and their roles
            </p>
          </div>
          <Button onClick={handleAddMember} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" /> Add Team Member
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Team Members</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Search & Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Search Team</CardTitle>
                <CardDescription>
                  Find team members by name or email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.length === 0 ? (
                <div className="col-span-full">
                  <Card className="text-center p-8">
                    <CardContent className="pt-8 pb-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No team members found</h3>
                      <p className="text-muted-foreground mb-4">
                        You have not added any team members yet. Click the button above to add one.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <Card key={member._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{member.name}</h3>
                          <Badge variant="default" className="mt-1 text-xs capitalize">
                            {member.teamRole.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {member.registered ? (
                            <CircleCheck className="h-4 w-4 text-green-500" />
                          ) : (
                            <CircleX className="h-4 w-4 text-red-500" />
                          )}
                          <span>
                            {member.registered ? 'Account Registered' : 'Pending Registration'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditMember(member)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit Member
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMember(member._id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal for adding/editing team members */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentMember ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
            <DialogDescription>
              {currentMember
                ? 'Make changes to this team member here.'
                : 'Fill out the form to add a new team member.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={newMember.teamRole}
                onValueChange={(value) => setNewMember({ ...newMember, teamRole: value as any })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : currentMember ? 'Save changes' : 'Add member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
