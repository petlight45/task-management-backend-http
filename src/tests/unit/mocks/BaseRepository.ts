import {BaseRepository} from "../../../adapters/repository";

export const MockBaseRepository: jest.Mocked<BaseRepository<any>> = {
    applyProjection: jest.fn(),
    create: jest.fn(),
    fetchMultiple: jest.fn(),
    fetchSingle: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};