import { activityStub } from '../stubs/activity.stub'

export const ActivitiesService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(activityStub()),
  findAll: jest.fn().mockResolvedValue([activityStub()]),
  findOne: jest.fn().mockResolvedValue(activityStub()),
  remove: jest.fn().mockResolvedValue({ deleted: true }),
  truncate: jest.fn().mockResolvedValue({ truncated: true }),
  saveAll: jest.fn().mockResolvedValue([activityStub()]),
})
