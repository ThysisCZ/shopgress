import { createContext, useContext, useState, useRef, useEffect } from 'react';
import mockData from '../mockData.json';
import { useUserContext } from './UserContext';

const SERVER_URI = process.env.REACT_APP_SERVER_URI;
const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === "true";

// Create shopping lists context
const ShoppingListsContext = createContext();

// Custom hook for shopping lists context
export function useShoppingListsContext() {
    return useContext(ShoppingListsContext);
}

// Component that provides shopping lists context
export function ShoppingListsProvider({ children }) {
    // Initialize with shopping lists from mockData
    const initialLists = (mockData.shoppingLists);
    const [shoppingLists, setShoppingLists] = useState(initialLists);
    const [showArchived, setShowArchived] = useState(false);
    const shoppingListsRef = useRef(shoppingLists);
    const { token } = useUserContext();

    // Keep reference updated
    useEffect(() => {
        shoppingListsRef.current = shoppingLists;
    }, [shoppingLists]);

    // Get all shopping lists
    const getAllLists = async () => {
        if (USE_MOCKS) {
            return shoppingListsRef.current
        } else {
            try {
                const response = await fetch(`${SERVER_URI}/shoppingList/list`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();
                const dtoOut = result.data;
                setShoppingLists(dtoOut);

                return dtoOut;
            } catch (e) {
                console.error("Error: " + e.message);
            }
        }
    }

    // Get a shopping list by ID
    const getListById = async (listId) => {
        if (USE_MOCKS) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const list = shoppingListsRef.current.find(list => list.list === listId);
                    resolve(list);
                }, 200);
            });
        } else {
            // Call the server
            try {
                const response = await fetch(`${SERVER_URI}/shoppingList/get/${listId}`, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const dtoOut = await response.json();
                return dtoOut
            } catch (e) {
                console.error("Error: " + e.message);
            }
        }
    };

    // Get shopping lists where the user is a member or owner
    const getListsByUser = async (userId) => {
        if (USE_MOCKS) {
            // Call mock data
            return new Promise(resolve => {
                setTimeout(() => {
                    const result = shoppingListsRef.current.filter(list =>
                        list.memberIds.includes(userId)
                    );

                    const dtoOut = showArchived ? result
                        : result.filter(list => !list.archived);

                    resolve(dtoOut);
                }, 200);
            });
        } else {
            // Call the server
            try {
                const response = await fetch(`${SERVER_URI}/shoppingList/list`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                let result = await response.json();
                result = result.data.filter(list => list.memberIds.includes(userId));
                const dtoOut = showArchived ? result
                    : result.filter(list => !list.archived);

                return dtoOut;
            } catch (e) {
                console.error("Error: " + e.message);
            }
        }
    };

    // Archive a shopping list
    const archiveList = (listId) => {
        return new Promise(resolve => {
            setTimeout(() => {
                setShoppingLists(prevLists =>
                    prevLists.map(list =>
                        list.listId === listId ? { ...list, archived: true } : list
                    )
                );
                resolve();
            }, 200);
        });
    }

    // Unarchive a shopping list
    const unarchiveList = (listId) => {
        return new Promise(resolve => {
            setTimeout(() => {
                setShoppingLists(prevLists =>
                    prevLists.map(list =>
                        list.listId === listId ? { ...list, archived: false } : list
                    )
                );
                resolve();
            }, 200);
        });
    }

    // Update a shopping list
    const updateList = async (updatedList) => {
        if (USE_MOCKS) {
            return new Promise(resolve => {
                setTimeout(() => {
                    setShoppingLists(prev =>
                        prev.map(list =>
                            list.listId === updatedList.listId ? updatedList : list
                        )
                    );
                    resolve();
                }, 200);
            });
        } else {
            // Call the server
            const dtoIn = {
                _id: updatedList._id,
                title: updatedList.title,
                archived: updatedList.archived
            }

            try {
                const response = await fetch(`${SERVER_URI}/shoppingList/update`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dtoIn)
                });

                const dtoOut = await response.json();
                return dtoOut;
            } catch (e) {
                console.error("Error: ", e.message);
            }
        }
    };

    // Add a new shopping list
    const addList = async (newList) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const listWithIds = {
                    ...newList,
                    listId: Date.now().toString()
                };

                setShoppingLists(prev => [...prev, listWithIds]);
                resolve(listWithIds);
            }, 200);
        });
    }

    // Delete a shopping list
    const deleteList = (listId) => {
        return new Promise(resolve => {
            setTimeout(() => {
                setShoppingLists(prevLists =>
                    prevLists.filter(list => list.listId !== listId)
                );
                resolve();
            }, 200);
        });
    }

    const value = {
        shoppingLists,
        setShoppingLists,
        getAllLists,
        getListById,
        getListsByUser,
        archiveList,
        unarchiveList,
        updateList,
        addList,
        deleteList,
        showArchived,
        setShowArchived
    }

    return (
        <ShoppingListsContext.Provider value={value}>
            {children}
        </ShoppingListsContext.Provider>
    )
}

