"use client";

import { useState, useEffect } from "react";
import { UserFilters, FilteredUser, getFilteredUsers, getFilteredUsersCount } from "@/app/actions/admin-users";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Filter, Users, Loader2 } from "lucide-react";

interface UserFilterPanelProps {
    onUsersSelected: (users: FilteredUser[]) => void;
    onCountUpdate: (count: number) => void;
}

export default function UserFilterPanel({ onUsersSelected, onCountUpdate }: UserFilterPanelProps) {
    const [filters, setFilters] = useState<UserFilters>({
        role: 'all',
        status: 'all',
        sellerStatus: 'all'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [userCount, setUserCount] = useState(0);

    // Update count when filters change
    useEffect(() => {
        const updateCount = async () => {
            try {
                const count = await getFilteredUsersCount(filters);
                setUserCount(count);
                onCountUpdate(count);
            } catch (error) {
                console.error("Error getting user count:", error);
            }
        };
        updateCount();
    }, [filters, onCountUpdate]);

    const handleApplyFilters = async () => {
        setIsLoading(true);
        try {
            const users = await getFilteredUsers(filters);
            onUsersSelected(users);
        } catch (error: any) {
            alert(error.message || "Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Filter Users</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Role Filter */}
                <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                        id="role"
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value as any })}
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Users Only</option>
                        <option value="admin">Admins Only</option>
                    </select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                    <Label htmlFor="status">Account Status</Label>
                    <select
                        id="status"
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="banned">Banned Only</option>
                    </select>
                </div>

                {/* Seller Filter */}
                <div className="space-y-2">
                    <Label htmlFor="seller">Seller Status</Label>
                    <select
                        id="seller"
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        value={filters.sellerStatus}
                        onChange={(e) => setFilters({ ...filters, sellerStatus: e.target.value as any })}
                    >
                        <option value="all">Everyone</option>
                        <option value="sellers">Sellers Only</option>
                        <option value="non-sellers">Non-Sellers Only</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{userCount} users</span>
                    <span>match current filters</span>
                </div>

                <Button onClick={handleApplyFilters} disabled={isLoading || userCount === 0}>
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                        </>
                    ) : (
                        <>
                            <Filter className="w-4 h-4 mr-2" />
                            Apply Filters
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
