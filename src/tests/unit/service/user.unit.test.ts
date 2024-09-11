import {asClass, asFunction, createContainer} from 'awilix';
import MockHelperUtils from "../mocks";
import {MockUserRepository} from "../mocks/UserRepository";
import {MockAuthService} from "../mocks/AuthService";
import {faker} from '@faker-js/faker';
import UserService from "../../../core/user/service";


describe('UserService', () => {
    let userService: UserService;
    let container: any;

    beforeEach(() => {
        container = createContainer();
        container.register({
            userService: asClass(UserService).singleton(),
            authService: asFunction(() => MockAuthService).singleton(),
            userRepository: asFunction(() => MockUserRepository).singleton(),
        });

        // Resolve the UserService from the container
        userService = container.resolve('userService');
    });
    it('should register a user', async () => {
        const mockUser = MockHelperUtils.generateMockUser();
        const payload = {
            email: mockUser.email,
            username: mockUser.username,
            password: faker.internet.password({
                memorable: true,
                pattern: /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$/
            })
        }
        MockUserRepository.findByEmail.mockResolvedValueOnce(null as any)
        MockUserRepository.findByUserName.mockResolvedValueOnce(null as any)
        MockAuthService.hashPassword.mockResolvedValueOnce(payload.password)
        MockUserRepository.create.mockResolvedValueOnce(mockUser);
        const result = await userService.registerUser(payload);
        expect(result).toEqual(mockUser);
    });

    it('should authenticate a user', async () => {
        const mockUser = MockHelperUtils.generateMockUser();
        const payload = {
            email: mockUser.email,
            password: faker.internet.password({
                memorable: true,
                pattern: /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$/
            })
        }
        const accessToken = faker.string.sample(20)
        const refreshToken = faker.string.sample(20)
        MockUserRepository.findByEmail.mockResolvedValueOnce(mockUser)
        MockUserRepository.findByUserName.mockResolvedValueOnce(mockUser)
        MockAuthService.comparePassword.mockResolvedValueOnce(true)
        MockAuthService.generateToken.mockResolvedValueOnce(accessToken).mockResolvedValueOnce(refreshToken)
        const result = await userService.authenticateUser(payload);
    });


    it('should fetch multiple users', async () => {
        const mockUsers = [MockHelperUtils.generateMockUser(), MockHelperUtils.generateMockUser()];
        MockUserRepository.fetchMultiple.mockResolvedValueOnce(mockUsers);
        const result = await userService.fetchMultipleUsers();
        expect(result).toEqual(mockUsers);
    });

    it('should fetch single user', async () => {
        const mockUser = MockHelperUtils.generateMockUser();
        MockUserRepository.fetchSingle.mockResolvedValueOnce(mockUser);
        const result = await userService.fetchSingleUser(mockUser._id as string);
        expect(result).toEqual(mockUser);
    });


});
