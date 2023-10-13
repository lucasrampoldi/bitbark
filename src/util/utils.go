package util

import (
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"github.com/getsentry/sentry-go"
	"golang.org/x/crypto/chacha20poly1305"
	"math/rand"
	"os"
	"strconv"
	"strings"
)

var sentryEnable, _ = strconv.ParseBool(os.Getenv("SENTRY_ENABLE"))

func ReplaceSpaceWithUnderscore(name string) string {
	return strings.Replace(name, "_", "", -1)
}
func RandomString(n int) string {
	var characterRunes = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	b := make([]rune, n)
	for i := range b {
		b[i] = characterRunes[rand.Intn(len(characterRunes))]
	}
	return string(b)
}
func DecryptString(key, ciphertext string) (string, error) {
	ciphertextBytes, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	nonce := ciphertextBytes[:12]
	ciphertextBytes = ciphertextBytes[12:]

	keyBytes := []byte(key)

	cipher, err := chacha20poly1305.New(keyBytes)
	if err != nil {
		return "", err
	}

	plaintext, err := cipher.Open(nil, nonce, ciphertextBytes, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}
func EncryptString(key, plaintext string) (string, error) {
	println(key)
	println(plaintext)

	nonce := make([]byte, 12)
	if _, err := rand.Read(nonce); err != nil {
		return "", err
	}

	keyBytes := []byte(key)

	cipher, err := chacha20poly1305.New(keyBytes)
	if err != nil {
		return "", err
	}
	ciphertext := cipher.Seal(nil, nonce, []byte(plaintext), nil)
	resultBytes := make([]byte, len(nonce)+len(ciphertext))
	copy(resultBytes[:], nonce)
	copy(resultBytes[12:], ciphertext)
	result := base64.StdEncoding.EncodeToString(resultBytes)

	return result, nil
}
func LastFourCharacters(accessKey string) string {
	length := len(accessKey)
	if length <= 4 {
		return accessKey
	}
	return "****" + accessKey[length-4:]
}

func GenerateRandomKey(keySize int) (string, error) {
	//keySize := 32 // Tamaño de la clave en bytes (256 bits)
	//randomKey, err := GenerateRandomKey(keySize)
	//if err != nil {
	//	fmt.Println("Error al generar la clave:", err)
	//	return
	//}
	//fmt.Println("Clave generada:", randomKey)

	key := make([]byte, keySize)
	_, err := rand.Read(key)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(key), nil
}

func SentryException(err error) {
	if sentryEnable {
		sentry.CaptureException(err)
	} else {
		fmt.Println(err.Error())
	}
}
