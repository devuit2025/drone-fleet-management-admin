import {
    NoFlyZoneClient,
    type CreateNoFlyZoneDto,
    type UpdateNoFlyZoneDto,
} from './noFlyZoneClient';

export const NoFlyZoneMutation = {
    create: (data: CreateNoFlyZoneDto) => NoFlyZoneClient.create(data),
    update: (id: number, data: UpdateNoFlyZoneDto) => NoFlyZoneClient.update(id, data),
    remove: (id: number) => NoFlyZoneClient.remove(id),
};
