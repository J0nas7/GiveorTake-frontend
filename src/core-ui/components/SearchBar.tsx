import { Block, Heading, Text } from "@/components";
import { env } from '@/env.urls';
import { useAxios, useDebounce, useURLLink } from "@/hooks";
import { selectAuthUser, useTypedSelector } from "@/redux";
import { Backlog, Organisation, Project, Task, TaskComment, TaskMediaFile, Team, User } from "@/types";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";

const SearchTextRotator = () => {
    const searchTerms = [
        "anything",
        "organisations",
        "teams",
        "projects",
        "tasks",
        "comments",
        "files",
    ];

    const [displayedText, setDisplayedText] = useState<string>("Search for anything");
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isSwitching, setIsSwitching] = useState<boolean>(false);

    useEffect(() => {
        // Function to handle the transition between search terms
        const handleSwitch = async () => {
            const currentTerm = searchTerms[currentIndex];
            const nextTerm = searchTerms[(currentIndex + 1) % searchTerms.length];

            // Step 1: Remove letters from the current search term
            for (let i = currentTerm.length; i >= 0; i--) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                setDisplayedText(`Search for ${currentTerm.slice(0, i)}`);
            }

            // Step 2: Add letters for the next search term
            for (let i = 0; i <= nextTerm.length; i++) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                setDisplayedText(`Search for ${nextTerm.slice(0, i)}`);
            }

            // Update the index to the next term in the array
            setCurrentIndex((prevIndex) => (prevIndex + 1) % searchTerms.length);
        };

        // Set up the interval to switch search terms every 8 seconds
        const interval = setInterval(() => {
            setIsSwitching(true);
            handleSwitch().then(() => setIsSwitching(false)); // Perform the switch
        }, 2500); // Change every 4 seconds

        return () => clearInterval(interval); // Clean up the interval on component unmount
    }, [currentIndex, searchTerms]);

    return {
        displayedText
    }
};

interface SearchResult {
    [key: string]: any[]; // Dynamic response object
}

const SearchBar = () => {
    const router = useRouter()
    const authUser = useTypedSelector(selectAuthUser);
    const { httpGetRequest } = useAxios();
    const { displayedText } = SearchTextRotator()
    const { convertID_NameStringToURLFormat } = useURLLink("-")

    const ref = useRef<HTMLDivElement | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined); // Track selected index
    const debouncedSearch = useDebounce(searchTerm, 500); // Avoids excessive API calls

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setResults(null); // Clear results on Escape
                setSelectedIndex(undefined); // Reset selected index
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (debouncedSearch && debouncedSearch.length >= 3) {
            fetchResults(debouncedSearch);
        } else {
            setResults(null); // Clear results when input is empty or shorter than 3 characters
        }
    }, [debouncedSearch]);

    const fetchResults = async (query: string) => {
        if (!authUser) return;

        setLoading(true);
        try {
            const data = await httpGetRequest(`search/${query}`);
            console.log("Search results:", data);

            if (data) {
                setResults(data);
                setSelectedIndex(undefined)
            }
        } catch (error) {
            console.error("Error fetching search results:", error);
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchTerm("") // Clear search term
        setResults(null); // Clear results on Escape
        setSelectedIndex(undefined); // Reset selected index
    }

    const tableToLabel: { [key: string]: string } = {
        GT_Organisations: 'Organisations',
        GT_Teams: 'Teams',
        GT_Projects: 'Projects',
        GT_Backlogs: 'Backlogs',
        GT_Tasks: 'Tasks',
        GT_Task_Media_Files: 'Media Files',
        GT_Task_Comments: 'Task Comments'
    };

    const formatResultItem = (item: any, type: string) => {
        switch (type) {
            case "GT_Users":
                const user: User = item
                return (
                    <div key={user.User_ID} className="flex items-center space-x-3">
                        {user.User_ImageSrc ? (
                            <img
                                src={user.User_ImageSrc}
                                alt={user.User_FirstName}
                                className="w-10 h-10 rounded-full border border-gray-300"
                            />
                        ) : (
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-300 text-white font-semibold rounded-full">
                                {user.User_FirstName?.charAt(0)}{user.User_Surname?.charAt(0)}
                            </div>
                        )}
                        <div>
                            <p className="font-semibold">{user.User_FirstName} {user.User_Surname}</p>
                            <p className="text-sm text-gray-500">{user.User_Email}</p>
                            <p className="text-xs text-gray-400">Status: {user.User_Status}</p>
                        </div>
                    </div>
                );
            case "GT_Organisations":
                const organisation: Organisation = item
                return (
                    <div key={organisation.Organisation_ID} className="space-y-2">
                        <p className="font-semibold">{organisation.Organisation_Name}</p>
                        <p
                            className="text-sm text-gray-500"
                            dangerouslySetInnerHTML={{
                                __html: organisation.Organisation_Description
                                    ? organisation.Organisation_Description
                                    : "No description"
                            }}
                        />
                    </div>
                );
            case "GT_Teams":
                const team: Team = item
                return (
                    <div key={team.Team_ID} className="space-y-2">
                        <p className="font-semibold">{team.Team_Name}</p>
                        <p
                            className="text-sm text-gray-500"
                            dangerouslySetInnerHTML={{
                                __html: team.Team_Description
                                    ? team.Team_Description
                                    : "No description"
                            }}
                        />
                    </div>
                );
            case "GT_Projects":
                const project: Project = item
                return (
                    <div key={project.Project_ID} className="space-y-2">
                        <p className="font-semibold">{project.Project_Name}</p>
                        <p className="text-sm text-gray-500">Key: {project.Project_Key}</p>
                        <p className="text-xs text-gray-400">Status: {project.Project_Status}</p>
                    </div>
                );
            case "GT_Backlogs":
                const backlog: Backlog = item
                return (
                    <div key={backlog.Backlog_ID} className="space-y-2">
                        <p className="font-semibold">{backlog.Backlog_Name}</p>
                        <p
                            className="text-sm text-gray-500"
                            dangerouslySetInnerHTML={{
                                __html: backlog.Backlog_Description
                                    ? backlog.Backlog_Description
                                    : "No description"
                            }}
                        />
                        <p className="text-xs text-gray-400">Primary: {backlog.Backlog_IsPrimary ? "Yes" : "No"}</p>
                    </div>
                );
            case "GT_Tasks":
                const task: Task = item
                return (
                    <div key={task.Task_ID} className="space-y-2">
                        <p className="font-semibold">{task.Task_Title}</p>
                        <p className="text-sm text-gray-500">Assigned To:{" "}
                            {task.user ? (
                                <>{task.user.User_FirstName} {task.user.User_Surname}</>
                            ) : (
                                <>Unassigned</>
                            )}
                        </p>
                        <p className="text-xs text-gray-400">Status: {task.status?.Status_Name}</p>
                    </div>
                );
            case "GT_Task_Media_Files":
                const mediaFile: TaskMediaFile = item
                return (
                    <div key={mediaFile.Media_ID} className="space-y-2 flex items-center gap-2">
                        {(mediaFile.Media_File_Type === "jpeg" || mediaFile.Media_File_Type === "jpg") ? (
                            <img
                                className="items-center justify-center bg-gray-300 w-20 h-20 !flex"
                                src={`${env.url.API_URL}/storage/${mediaFile.Media_File_Path}`}
                            />
                        ) : (
                            <span className="items-center justify-center bg-gray-300 w-20 h-20 !flex">
                                <Text variant="span" className="text-sm font-semibold">PDF</Text>
                            </span>
                        )}
                        <div>
                            <p className="font-semibold">{mediaFile.Media_File_Name}</p>
                            <p className="text-sm text-gray-500">Type: {mediaFile.Media_File_Type}</p>
                            <p className="text-xs text-gray-400">
                                Uploaded: {new Date(mediaFile.Media_CreatedAt).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">Task: {mediaFile.task?.Task_Title}</p>
                        </div>
                    </div>
                );
            case "GT_Task_Comments":
                const taskComment: TaskComment = item;
                return (
                    <div key={taskComment.Comment_ID} className="space-y-2 border-b pb-2">
                        <p className="text-sm">{taskComment.Comment_Text}</p>
                        <p className="text-xs text-gray-500">
                            By:{" "}
                            {taskComment.user ? (
                                <>
                                    {taskComment.user.User_FirstName} {taskComment.user.User_Surname}
                                </>
                            ) : (
                                <>Unknown User</>
                            )}
                        </p>
                        {taskComment.Comment_CreatedAt && (
                            <p className="text-xs text-gray-400">
                                Posted: {new Date(taskComment.Comment_CreatedAt).toLocaleString()}
                            </p>
                        )}
                        <p className="text-xs text-gray-400">Task: {taskComment.task?.Task_Title}</p>
                    </div>
                );
            default:
                return <div key={item.id}>{JSON.stringify(item)}</div>;
        }
    };

    const formatChooseItem = (item: any, type: string) => {
        console.log("formatChooseItem", type, item)
        switch (type) {
            case "GT_Users":
                const user: User = item
                break
            case "GT_Organisations":
                const organisation: Organisation = item
                router.push(`/organisation/${convertID_NameStringToURLFormat((organisation.Organisation_ID ?? 0), organisation.Organisation_Name)}`)
                clearSearch()
                break
            case "GT_Teams":
                const team: Team = item
                router.push(`/team/${convertID_NameStringToURLFormat((team.Team_ID ?? 0), team.Team_Name)}`)
                clearSearch()
                break
            case "GT_Projects":
                const project: Project = item
                router.push(`/project/${convertID_NameStringToURLFormat((project.Project_ID ?? 0), project.Project_Name)}`)
                clearSearch()
                break
            case "GT_Backlogs":
                const backlog: Backlog = item
                router.push(`/backlog/${convertID_NameStringToURLFormat((backlog.Backlog_ID ?? 0), backlog.Backlog_Name)}`)
                clearSearch()
                break
            case "GT_Tasks":
                const task: Task = item
                router.push(`/task/${task.backlog?.project?.Project_Key}/${convertID_NameStringToURLFormat((task.Task_Key ?? 0), task.Task_Title)}`)
                clearSearch()
                break
            case "GT_Task_Media_Files":
                const mediaFile: TaskMediaFile = item
                router.push(`${env.url.API_URL}/storage/${mediaFile.Media_File_Path}`)
                clearSearch()
                break
            default:
                return null
        }
    }

    // Function to handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (results) {
            if (e.key === "ArrowDown") {
                const newIndex = (selectedIndex !== undefined && (selectedIndex + 1) < getResultLength() ? selectedIndex + 1 : 0)
                setSelectedIndex(newIndex);
            } else if (e.key === "ArrowUp") {
                const newIndex = (selectedIndex !== undefined && selectedIndex > 0 ? selectedIndex - 1 : getResultLength() - 1)
                setSelectedIndex(newIndex);
            } else if (e.key === "Escape") {
                setResults(null); // Clear results on Escape
                setSelectedIndex(undefined); // Reset selected index
            } else if (e.key === 'Enter' && selectedIndex !== undefined) {
                // Flatten results but keep track of table names
                const flattenedResults: { item: any; table: string }[] = Object.entries(results)
                    .flatMap(([table, items]) => items.map(item => ({ item, table })));

                const selectedItemData = flattenedResults[selectedIndex];

                if (selectedItemData) {
                    formatChooseItem(selectedItemData.item, selectedItemData.table);
                }
            }
        }
    };

    // Helper function to get total result length
    const getResultLength = () => {
        if (results) {
            return Object.values(results).reduce((acc, tableItems) => acc + tableItems.length, 0);
        }
        return 0;
    };

    return (
        <div ref={ref} className="w-full max-w-md relative" onKeyDown={handleKeyDown} tabIndex={0}>
            <div className="relative">
                <Block variant="span" className="flex items-center border bg-white border-gray-300 rounded-md">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="text-gray-500 ml-3"
                    />
                    <input
                        type="text"
                        placeholder={displayedText}
                        value={searchTerm}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border-none text-black focus:outline-none"
                    />
                </Block>
            </div>

            {/* Display Results */}
            {results && (
                <div className="p-3 border rounded-md bg-white text-black shadow-lg absolute top-10 w-full overflow-y-auto overflow-x-hidden  max-h-[90vh]">
                    {Object.keys(results).length > 0 && (
                        (() => {
                            let searchIndex = -1;

                            return (
                                <>
                                    <Block>
                                        <Text>{getResultLength()} search results</Text>
                                        <Text variant="small" className="text-gray-400 text-xs">Keyboard-navigation with buttons ↑ ↓ ↵</Text>
                                    </Block>

                                    {Object.entries(results).map(([table, items]) => (
                                        <div key={table} className="space-y-4">
                                            <Heading variant="h3" className="font-semibold text-xl">
                                                {tableToLabel[table] || table} {/* Default to the table name if no mapping exists */}
                                            </Heading>
                                            <div className="space-y-2">
                                                {Array.isArray(items) ? (
                                                    <>
                                                        {items.map((item, index) => {
                                                            searchIndex++
                                                            const itemIndex = searchIndex
                                                            const itemId = item[`${table}ID`] || item.id; // Get unique ID (adjust based on your structure)
                                                            const isSelected = selectedIndex === searchIndex; // Check if item is selected
                                                            return (
                                                                <div
                                                                    key={itemId}
                                                                    onMouseOver={() => setSelectedIndex(itemIndex)}
                                                                    className={`p-3 border rounded-md shadow-sm ${isSelected ? 'bg-blue-100' : ''}`} // Highlight selected item
                                                                >
                                                                    {formatResultItem(item, table)}
                                                                </div>
                                                            );
                                                        })}
                                                    </>
                                                ) : (
                                                    <>{items}</>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )
                        })()
                    )}
                </div>
            )
            }
        </div >
    );
};

export default SearchBar;
