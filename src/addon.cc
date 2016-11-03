#include <nan.h>
#include "async.h"

using v8::FunctionTemplate;
using v8::String;
using Nan::GetFunction;
using Nan::New;
using Nan::Set;

NAN_MODULE_INIT(InitAll) {
  Set(target, New<String>("getIdentity").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(GetIdentity)).ToLocalChecked());

  Set(target, New<String>("addIdentity").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(AddIdentity)).ToLocalChecked());
}

NODE_MODULE(addon, InitAll)
