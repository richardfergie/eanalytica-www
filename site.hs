--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings #-}
import Data.Monoid (mappend, (<>))
import Control.Monad
import Hakyll
import System.FilePath
import Data.List

--------------------------------------------------------------------------------
cleanDate :: Routes
cleanDate = customRoute removeDatePrefix

removeDatePrefix :: Identifier -> FilePath
removeDatePrefix ident = replaceFileName file (drop 11 $ takeFileName file)
   where file = toFilePath ident

blogRoute :: Routes
blogRoute  =
      gsubRoute "posts/" (const "blog/")
      `composeRoutes` cleanDate
      `composeRoutes` gsubRoute ".markdown" (const "/index.html")
      `composeRoutes` gsubRoute ".html" (const "/index.html")
      `composeRoutes` gsubRoute ".lhs" (const "/index.html")

slashUrlsCompiler :: Item String -> Compiler (Item String)
slashUrlsCompiler item = do
     route <- getRoute $ itemIdentifier item
     return $ case route of
         Nothing -> item
         Just r -> fmap slashUrls item

slashUrls :: String -> String
slashUrls = withUrls convert
  where
    convert = replaceAll "/index.html" (const "/")

makeId :: PageNumber -> Identifier
makeId pageNum = fromFilePath $ "blog/page/" ++ (show pageNum) ++ "/index.html"

grouper :: MonadMetadata m => [Identifier] -> m [[Identifier]]
grouper ids = (liftM (paginateEvery 5) . sortRecentFirst) ids

archiveRoute pageNum = case pageNum of
  1 -> constRoute "blog/index.html"
  x -> constRoute $ "blog/"++(show x)++"/index.html"

introField :: Context String
introField = field "intro" $ \item -> do
    body <- itemBody <$> loadSnapshot (itemIdentifier item) "intro"
    return $ (maxLengthTeaser . compactTeaser) body
  where
    maxLengthTeaser :: String -> String
    maxLengthTeaser s = if findIndex (isPrefixOf "<!-- more -->") (tails s) == Nothing
                            then unwords (take 200 (words s))
                            else s
    compactTeaser :: String -> String
    compactTeaser =
        (replaceAll "<iframe [^>]*>" (const "")) .
        (replaceAll "<img [^>]*>" (const "")) .
        (replaceAll "<p>" (const "")) .
        (replaceAll "</p>" (const "")) .
        (replaceAll "<blockquote>" (const "")) .
        (replaceAll "</blockquote>" (const "")) .
        (replaceAll "<strong>" (const "")) .
        (replaceAll "</strong>" (const "")) .
        (replaceAll "<ol>" (const "")) .
        (replaceAll "</ol>" (const "")) .
        (replaceAll "<ul>" (const "")) .
        (replaceAll "</ul>" (const "")) .
        (replaceAll "<strike>" (const "")) .
        (replaceAll "</strike>" (const "")) .
        (replaceAll "<li>" (const "")) .
        (replaceAll "</li>" (const "")) .
        (replaceAll "<div[^>]*>" (const "")) .
        (replaceAll "</div>" (const "")) .
        (replaceAll "<h[0-9][^>]*>" (const "")) .
        (replaceAll "</h[0-9]>" (const "")) .
        (replaceAll "<pre.*" (const "")) .
        (replaceAll "<a [^>]*>" (const "")) .
        (replaceAll "</a>" (const "")) .
        (replaceAll "<hr>" (const ""))


main :: IO ()
main = hakyll $ do
    match "images/*" $ do
        route   idRoute
        compile copyFileCompiler

    match "css/*" $ do
        route   idRoute
        compile compressCssCompiler

    match (fromList ["about.rst", "contact.markdown"]) $ do
        route   $ setExtension "html"
        compile $ pandocCompiler
            >>= loadAndApplyTemplate "templates/default.html" defaultContext
            >>= relativizeUrls

    match "posts/*" $ do
        route blogRoute
        compile $ pandocCompiler
            >>= saveSnapshot "intro"
            >>= loadAndApplyTemplate "templates/post.html"    postCtx
            >>= loadAndApplyTemplate "templates/default.html" postCtx
            >>= relativizeUrls
            >>= slashUrlsCompiler

    pag <- buildPaginateWith grouper "posts/*" makeId

    paginateRules pag $ \pageNum pattern -> do
        route $ archiveRoute pageNum
        compile $ do
            posts <- recentFirst =<< loadAll pattern
            let paginateCtx = paginateContext pag pageNum
                title = case pageNum of
                  1 -> "Archive"
                  x -> "Archive - Page "++(show x)
                ctx = constField "title" title <>
                      listField "posts" (postCtx <> introField) (return posts) <>
                      paginateCtx <>
                      defaultContext
            makeItem ""
                >>= loadAndApplyTemplate "templates/archive.html" ctx
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= relativizeUrls
                >>= slashUrlsCompiler

    match "site.lhs" $ do
       route (constRoute "site/index.html")
       compile $ do
         let ctx = field "title" (\_ -> return "Hakyll code for this site") <> defaultContext
         pandocCompilerWith defaultHakyllReaderOptions pandocWriteOptions
           >>= loadAndApplyTemplate "templates/page.html" ctx
           >>= loadAndApplyTemplate "templates/default.html" ctx
           >>= slashUrlsCompiler

    match "index.html" $ do
        route idRoute
        compile $ do
            posts <- recentFirst =<< loadAll "posts/*"
            let indexCtx =
                    listField "posts" postCtx (return posts) `mappend`
                    constField "title" "Home"                `mappend`
                    defaultContext

            getResourceBody
                >>= applyAsTemplate indexCtx
                >>= loadAndApplyTemplate "templates/default.html" indexCtx
                >>= relativizeUrls

    match "templates/*" $ compile templateCompiler


--------------------------------------------------------------------------------
postCtx :: Context String
postCtx =
    dateField "date" "%B %e, %Y" `mappend`
    defaultContext
