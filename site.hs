--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings #-}
import Data.Monoid (mappend, (<>))
import Control.Monad
import Hakyll
import System.FilePath
import Data.List
import Text.Pandoc

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
      `composeRoutes` gsubRoute ".org" (const "/index.html")

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

rawRoute :: Routes
rawRoute = gsubRoute "raw/" (const "")
                `composeRoutes` gsubRoute ".html" (const "/index.html")
                `composeRoutes` gsubRoute ".markdown" (const "/index.html")
                `composeRoutes` gsubRoute ".lhs" (const "/index.html")

main :: IO ()
main = hakyll $ do
    match "images/*" $ do
        route   idRoute
        compile copyFileCompiler

    match "files/*" $ do
      route idRoute
      compile copyFileCompiler

    match "css/*" $ do
        route   idRoute
        compile compressCssCompiler

    match "raw/*" $ do
      route rawRoute
      compile copyFileCompiler

    match (fromList ["about.rst"]) $ do
        route   $ setExtension "html"
        compile $ pandocCompiler
            >>= loadAndApplyTemplate "templates/default.html" defaultContext
            >>= relativizeUrls

    match "google49c11d79480ceef2.html" $ do
      route idRoute
      compile copyFileCompiler

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
                      field "blog" (const $ return "blog") <>
                      paginateCtx <>
                      defaultContext
            makeItem ""
                >>= loadAndApplyTemplate "templates/archive.html" ctx
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= relativizeUrls
                >>= slashUrlsCompiler

    match "site.lhs" $ do --won't match unless this file is .lhs
       route (constRoute "site/index.html")
       compile $ do
         let ctx = field "title" (\_ -> return "Hakyll code for this site") <> defaultContext
             pandocWriteOptions = defaultHakyllWriterOptions
               { writerReferenceLinks = True
               }
         pandocCompilerWith defaultHakyllReaderOptions pandocWriteOptions
           >>= loadAndApplyTemplate "templates/page.html" ctx
           >>= loadAndApplyTemplate "templates/default.html" ctx
           >>= slashUrlsCompiler

    match "index.html" $ do
        route idRoute
        let ctx = field "home" (const $ return "home") <> defaultContext
        compile $ do
            getResourceBody
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= slashUrlsCompiler

    match "contact.html" $ do
      route $ constRoute "contact/index.html"
      let ctx = field "contact" (const $ return "contact") <> defaultContext
      compile $ do
            getResourceBody
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= slashUrlsCompiler

    match "services.html" $ do
      route $ constRoute "services/index.html"
      let ctx = field "services" (const $ return "services") <> defaultContext
      compile $ do
            getResourceBody
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= slashUrlsCompiler

    match "about.html" $ do
      route $ constRoute "about/index.html"
      let ctx = field "about" (const $ return "about") <>
                defaultContext
      compile $ do
            getResourceBody
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= slashUrlsCompiler

    match "favicon.ico" $ do
      route   idRoute
      compile copyFileCompiler

    create ["sitemap.xml"] $ do
         route   idRoute
         compile $ do
           posts <- recentFirst =<< loadAll "posts/*"
           raw <- (loadAll "raw/*")::(Compiler [Item CopyFile])
           let sitemapCtx = mconcat
                            [ listField "rawentries"
                                        (field "url" (return .
                                                      (replaceAll ".html" (const "/")) .
                                                      (drop 4) .
                                                      toFilePath .
                                                      itemIdentifier)) $ return raw
                            , listField "blogentries"
                                        (mapContext (replaceAll "/index.html" (const "/")) postCtx)
                                        $ return posts
                            , defaultContext
                            ]
           makeItem ""
            >>= loadAndApplyTemplate "templates/sitemap.xml" sitemapCtx
             >>= slashUrlsCompiler


    match "templates/*" $ compile templateCompiler


--------------------------------------------------------------------------------
postCtx :: Context String
postCtx =
    dateField "date" "%B %e, %Y" <>
    dateField "lastmod" "%Y-%m-%d" <>
    field "blog" (const $ return "blog") <>
    defaultContext
