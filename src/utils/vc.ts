import { Keyring } from "@zcloak/keyring";
import { restore } from "@zcloak/did/keys";
import { initCrypto } from "@zcloak/crypto";
import { encryptMessage } from "@zcloak/message";
import { Raw, VerifiableCredentialBuilder } from "@zcloak/vc";

import type { CType } from "@zcloak/ctype/types";
import type { RawCredential } from "@zcloak/vc/types";
import type { DidUrl } from "@zcloak/did-resolver/types";
import type { VerifiableCredential } from "@zcloak/vc/types";

import { resolver } from "../zclaok/resolverHelper";
import { readDidKeysFile } from "../zclaok/didHelper";
import { getCtypeFromHash } from "../zclaok/ctypeHelper";
import { fromDidDocument } from "@zcloak/did/did/helpers";
import { sendMessage2Server } from "../zclaok/messageHelper";


export async function issue(receiver: any, ctypeHash: string, contents: any): Promise<string> {
  // initCrypto for wasm
  await initCrypto();
  console.log("initCrypto for wasm...");

  const holderDidUrl = receiver;
  const holderDidDoc = await resolver.resolve(holderDidUrl);
  const holder = fromDidDocument(holderDidDoc);

  const keyring = new Keyring();
  const json = readDidKeysFile();
  const password = process.env.ATTESTER_PWD;
  const attester = restore(keyring, json, password);

  // step1: get ctype
  const ctype: CType = await getCtypeFromHash(ctypeHash);

  // step2: build raw
  const raw = new Raw({
    contents: contents,
    owner: holderDidUrl,
    ctype: ctype,
    hashType: "Keccak256",
  });

  // step3: build rawCredential from raw
  const rawCredential: RawCredential = raw.toRawCredential("Keccak256");

  // step4: build a vcBuilder by using rawCredential and ctype
  const vcBuilder = VerifiableCredentialBuilder.fromRawCredential(
    rawCredential,
    ctype
  )
    .setExpirationDate(null)
    .setIssuanceDate(Date.now());

  // step5: build a vc
  const vc: VerifiableCredential<true> = await vcBuilder.build(
    attester,
    true
  );

  // console.log(vc);

  // const holderDidUrl2: DidUrl =
  // "did:zk:0x237Ec821FDF943776A8e27a9fd9dd6f78400071b";
  // const holderDidDoc2 = await resolver.resolve(holderDidUrl2);
  // const isValid = await vcVerify(vc,holderDidDoc2);
  // console.log('====isvalid====', isValid);


  // step6: encrypt message
  // notice: receiverUrl parameter is holder's keyAgreement key
  const message = await encryptMessage(
    "Send_issuedVC",
    vc,
    attester,
    holder.getKeyUrl("keyAgreement"),
    undefined,
    resolver
  );

  // step7: send encrypted message to server
  await sendMessage2Server(message);

  return JSON.stringify(vc);
};