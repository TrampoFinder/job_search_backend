import { Global, Module } from '@nestjs/common';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import { IdentityModule } from '@identityModule/identity.module';
import { IdentityPublicApiProvider } from './provider/public-api.provider';

@Global()
@Module({
  imports: [IdentityModule],
  providers: [
    IdentityPublicApiProvider,
    {
      provide: IdentityAuthenticateApi,
      useExisting: IdentityPublicApiProvider,
    },
  ],
  exports: [IdentityAuthenticateApi],
})
export class IdentityIntegrationModule {}
