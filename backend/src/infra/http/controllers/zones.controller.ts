import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateZoneUseCase } from '@/domain/zones/application/use-cases/create-zone.use-case';
import { GetZoneByIdUseCase } from '@/domain/zones/application/use-cases/get-zone-by-id.use-case';
import { ListZonesUseCase } from '@/domain/zones/application/use-cases/list-zones.use-case';
import { SearchZonesByNameUseCase } from '@/domain/zones/application/use-cases/search-zones-by-name.use-case';
import { InvalidZoneError } from '@/domain/zones/enterprise/errors/invalid-zone-error';
import { CreateZoneDto } from '../dtos/create-zone.dto';
import { ZonePresenter } from '../presenters/zone.presenter';

const zoneExample = {
  id: 'b9f0ac89-2c0c-4f9f-bb6d-8f46f7b2c5f1',
  name: 'Central Park',
  type: 'RESIDENTIAL',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-73.97, 40.77],
        [-73.98, 40.78],
        [-73.99, 40.77],
        [-73.97, 40.76],
        [-73.97, 40.77],
      ],
    ],
  },
  createdAt: '2024-01-01T00:00:00.000Z',
};

@ApiTags('zones')
@ApiExtraModels(ZonePresenter)
@Controller('zones')
export class ZonesController {
  constructor(
    @Inject(CreateZoneUseCase)
    private readonly createZoneUseCase: CreateZoneUseCase,
    @Inject(ListZonesUseCase)
    private readonly listZonesUseCase: ListZonesUseCase,
    @Inject(SearchZonesByNameUseCase)
    private readonly searchZonesByNameUseCase: SearchZonesByNameUseCase,
    @Inject(GetZoneByIdUseCase)
    private readonly getZoneByIdUseCase: GetZoneByIdUseCase,
  ) {}

  @Get()
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filtra pelo nome (case-insensitive)',
    example: 'park',
  })
  @ApiOkResponse({
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(ZonePresenter) },
          example: [zoneExample],
        },
      },
    },
  })
  async findAll(@Query('name') name?: string) {
    if (name) {
      const result = await this.searchZonesByNameUseCase.execute({ name });

      if (result.isLeft()) {
        return { data: [] };
      }

      const { zones } = result.value;
      return { data: zones.map(ZonePresenter.toHttp) };
    }

    const result = await this.listZonesUseCase.execute();
    if (result.isLeft()) {
      return { data: [] };
    }

    const { zones } = result.value;

    return { data: zones.map(ZonePresenter.toHttp) };
  }

  @Get(':id')
  @ApiOkResponse({
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(ZonePresenter),
          example: zoneExample,
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Zona nao encontrada',
    schema: { example: { statusCode: 404, message: 'Zone with id "<id>" not found' } },
  })
  async findById(@Param('id') id: string) {
    const result = await this.getZoneByIdUseCase.execute({ zoneId: id });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { data: ZonePresenter.toHttp(result.value.zone) };
  }

  @Post()
  @ApiCreatedResponse({
    description: 'Zona criada com sucesso',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(ZonePresenter),
          example: zoneExample,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados invalidos',
    schema: { example: { statusCode: 400, message: 'Invalid zone data' } },
  })
  async create(@Body() body: CreateZoneDto) {
    const result = await this.createZoneUseCase.execute({
      name: body.name,
      type: body.type,
      geometry: body.geometry as any,
    });

    if (result.isLeft()) {
      const error = result.value;
      const message =
        error instanceof InvalidZoneError ? error.message : 'Invalid zone data';
      throw new BadRequestException(message);
    }

    return { data: ZonePresenter.toHttp(result.value.zone) };
  }
}
