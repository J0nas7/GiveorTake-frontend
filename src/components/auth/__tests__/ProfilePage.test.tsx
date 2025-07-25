import { TestProvider } from '@/__tests__/test-utils';
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Profile } from '../ProfilePage/Profile';
import { ProfileForm } from '../ProfilePage/ProfileForm';
import { ProfileHeader } from '../ProfilePage/ProfileHeader';
import { ProfileOrganisation } from '../ProfilePage/ProfileOrganisation';

void React.createElement

describe('ProfilePage Components', () => {
    describe('Profile', () => {
        const mockProps = {
            renderUser: {
                User_ID: 0,
                User_FirstName: 'John',
                User_Surname: 'Doe',
                User_Email: 'john.doe@example.com',
                User_Status: "1"
            },
            imagePreview: 'image-preview-url',
            renderOrganisation: {
                User_ID: 0,
                Organisation_ID: 1,
                Organisation_Name: 'Test Org'
            },
            accessToken: 'mockedAccessToken',
            handleChange: jest.fn(),
            handleImageUpload: jest.fn(),
            handleSaveChanges: jest.fn(),
            handleDeleteUser: jest.fn(),
            Canvas: () => <div>Canvas</div>,
        };

        const renderProfile = (props = {}) =>
            render(
                <TestProvider>
                    <Profile {...mockProps} {...props} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();

            renderProfile()
        });

        it('renders profile title and user name', () => {
            expect(screen.getByText(/Profile Settings/i)).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        it('renders image preview if available', () => {
            const image = screen.getByAltText(/User Profile/i);
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'image-preview-url');
        });

        it('renders organisation name', () => {
            expect(screen.getByText(/Test Org/i)).toBeInTheDocument();
        });

        it('calls handleImageUpload on file input change', () => {
            const fileInput = screen.getByLabelText(/Profile Image/i);
            const file = new File(['dummy'], 'avatar.png', { type: 'image/png' });
            fireEvent.change(fileInput, { target: { files: [file] } });
            expect(mockProps.handleImageUpload).toHaveBeenCalled();
        });

        it('renders null if renderUser is undefined', () => {
            cleanup(); // Clear the DOM from beforeEach render
            const { container } = renderProfile({ renderUser: undefined })

            expect(container.textContent?.trim()).toBe('');
        });
    });

    describe("ProfileForm", () => {
        const mockFormProps = {
            renderUser: {
                User_ID: 0,
                User_FirstName: "John",
                User_Surname: "Doe",
                User_Email: "john.doe@example.com",
                User_Status: "1",
            },
            imagePreview: "image-preview-url",
            handleChange: jest.fn(),
            handleImageUpload: jest.fn(),
            handleSaveChanges: jest.fn(),
            handleDeleteUser: jest.fn(),
            accessToken: "mockedAccessToken",
            Canvas: () => <div>Canvas</div>,
        };

        const renderProfileForm = (props = {}) =>
            render(
                <TestProvider>
                    <ProfileForm {...mockFormProps} {...props} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();

            renderProfileForm()
        });

        it("renders form fields with correct initial values", () => {
            expect(screen.getByLabelText("First Name")).toBeInTheDocument();
            expect(screen.getByLabelText("First Name")).toHaveValue("John");

            expect(screen.getByLabelText("Surname")).toBeInTheDocument();
            expect(screen.getByLabelText("Surname")).toHaveValue("Doe");

            expect(screen.getByLabelText("Email")).toBeInTheDocument();
            expect(screen.getByLabelText("Email")).toHaveValue("john.doe@example.com");

            expect(screen.getByLabelText("Profile Image")).toBeInTheDocument();
        });

        it("calls handleChange when input fields change", () => {
            fireEvent.change(screen.getByLabelText("First Name"), {
                target: { value: "Jane" },
            });
            expect(mockFormProps.handleChange).toHaveBeenCalledTimes(1);

            fireEvent.change(screen.getByLabelText("Surname"), {
                target: { value: "Smith" },
            });
            expect(mockFormProps.handleChange).toHaveBeenCalledTimes(2);

            fireEvent.change(screen.getByLabelText("Email"), {
                target: { value: "jane.smith@example.com" },
            });
            expect(mockFormProps.handleChange).toHaveBeenCalledTimes(3);
        });

        it("calls handleImageUpload when profile image file input changes", () => {
            const file = new File(["dummy content"], "photo.png", { type: "image/png" });
            fireEvent.change(screen.getByLabelText("Profile Image"), {
                target: { files: [file] },
            });

            expect(mockFormProps.handleImageUpload).toHaveBeenCalledTimes(1);
        });

        it("displays image preview if imagePreview is provided", () => {
            const image = screen.getByAltText("User Profile") as HTMLImageElement;
            expect(image).toBeInTheDocument();
            expect(image.src).toContain("image-preview-url");
        });

        it("displays 'No image' if imagePreview is not provided", () => {
            renderProfileForm({ imagePreview: undefined })

            expect(screen.getByText("No image")).toBeInTheDocument();
        });

        it("renders the Canvas component", () => {
            expect(screen.getByText("Canvas")).toBeInTheDocument();
        });

        it("calls handleSaveChanges and handleDeleteUser on button clicks", () => {
            fireEvent.click(screen.getByText("Save Changes"));
            expect(mockFormProps.handleSaveChanges).toHaveBeenCalledTimes(1);

            fireEvent.click(screen.getByText("Delete User"));
            expect(mockFormProps.handleDeleteUser).toHaveBeenCalledTimes(1);
        });

        it("shows deleted message and hides buttons if user is deleted", () => {
            cleanup(); // Clear the DOM from beforeEach render
            renderProfileForm({ renderUser: { ...mockFormProps.renderUser, User_DeletedAt: "2023-01-01" } })

            expect(screen.getByText("This user has been deleted.")).toBeInTheDocument();
            expect(screen.queryByText("Save Changes")).toBeNull();
            expect(screen.queryByText("Delete User")).toBeNull();
        });
    });

    describe('ProfileHeader', () => {
        const renderProfileHeader = () =>
            render(
                <TestProvider>
                    <ProfileHeader />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();

            renderProfileHeader()
        });

        it('renders the go to home link with correct text', () => {
            const link = screen.getByRole('link', { name: /Go to Home/i });
            expect(link).toBeInTheDocument();
        });

        it('link points to the root URL "/"', () => {
            const link = screen.getByRole('link', { name: /Go to Home/i });
            expect(link).toHaveAttribute('href', '/');
        });

        it('renders the house icon', () => {
            // We can't directly select FontAwesomeIcon, but can check if SVG is in the link
            const link = screen.getByRole('link', { name: /Go to Home/i });
            const svg = link.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });

        it('has expected CSS classes for styling', () => {
            const link = screen.getByRole('link', { name: /Go to Home/i });
            expect(link).toHaveClass('blue-link', 'action-button', 'button-right');
        });
    });

    describe("ProfileOrganisation", () => {
        const mockOrgProps = {
            renderOrganisation: {
                User_ID: 0,
                Organisation_ID: 1,
                Organisation_Name: "Test Org",
            },
        };

        const renderProfileOrganisation = (props = {}) =>
            render(
                <TestProvider>
                    <ProfileOrganisation {...mockOrgProps} {...props} />
                </TestProvider>
            );

        beforeEach(() => {
            jest.clearAllMocks();

            renderProfileOrganisation()
        });

        it("renders the section heading", () => {
            expect(
                screen.getByRole("heading", { name: /Organisation this user is a part of/i })
            ).toBeInTheDocument();
        });

        it("renders organisation name and link if organisation is provided", () => {
            const orgLink = screen.getByRole("link", { name: /Test Org/i });
            expect(orgLink).toBeInTheDocument();
            expect(orgLink).toHaveAttribute("href", "/organisation/1");

            expect(screen.getByText("Organisation Name:")).toBeInTheDocument();
        });

        it("renders message when organisation is not provided", () => {
            cleanup(); // Clear the DOM from beforeEach render
            renderProfileOrganisation({ renderOrganisation: undefined });

            expect(screen.getByText("This user is not part of any organisation.")).toBeInTheDocument();
        });

        it("does not render organisation list when organisation is not provided", () => {
            cleanup(); // Clear the DOM from beforeEach render
            renderProfileOrganisation({ renderOrganisation: undefined });

            expect(screen.queryByRole("list")).toBeNull();
            expect(screen.queryByRole("listitem")).toBeNull();
            expect(screen.queryByRole("link")).toBeNull();
        });

        it("matches snapshot when organisation is provided", () => {
            cleanup(); // Clear the DOM from beforeEach render
            const { container } = renderProfileOrganisation()

            expect(container).toMatchSnapshot();
        });

        it("matches snapshot when organisation is not provided", () => {
            cleanup(); // Clear the DOM from beforeEach render
            const { container } = renderProfileOrganisation({ renderOrganisation: undefined });

            expect(container).toMatchSnapshot();
        });
    });
});
